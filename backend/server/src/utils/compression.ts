import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createGzip, createGunzip } from 'node:zlib';
import { basename, dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { ensureDirectory, ensureFileDirectory } from './fileSystem';

export type CompressionFormat = 'gzip' | 'zip' | 'tar.gz' | 'none';

function runCommand(command: string, args: string[], options: { cwd?: string } = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: options.cwd, stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} s'est terminé avec le code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

export async function compressFile(
  inputPath: string,
  outputPath: string,
  format: CompressionFormat = 'gzip',
): Promise<string> {
  await ensureFileDirectory(outputPath);

  if (format === 'none') {
    return inputPath;
  }

  switch (format) {
    case 'gzip': {
      const source = createReadStream(inputPath);
      const target = createWriteStream(outputPath);
      await pipeline(source, createGzip(), target);
      return outputPath;
    }
    case 'zip': {
      await runCommand('zip', ['-j', outputPath, inputPath]);
      return outputPath;
    }
    case 'tar.gz': {
      const folder = dirname(inputPath);
      const fileName = basename(inputPath);
      await runCommand('tar', ['-czf', outputPath, '-C', folder, fileName]);
      return outputPath;
    }
    default:
      throw new Error(`Format de compression non supporté: ${format}`);
  }
}

export async function decompressFile(
  inputPath: string,
  outputDir: string,
  format: CompressionFormat,
  expectedName?: string,
): Promise<string> {
  await ensureDirectory(outputDir);

  switch (format) {
    case 'gzip': {
      const targetFile = join(outputDir, expectedName || inputPath.replace(/\.gz$/, ''));
      await ensureFileDirectory(targetFile);
      const source = createReadStream(inputPath);
      const target = createWriteStream(targetFile);
      await pipeline(source, createGunzip(), target);
      return targetFile;
    }
    case 'zip': {
      const fileName = expectedName || basename(inputPath).replace(/\.zip$/, '');
      const targetFile = join(outputDir, fileName);
      await ensureFileDirectory(targetFile);
      await new Promise<void>((resolve, reject) => {
        const child = spawn('unzip', ['-p', inputPath]);
        const target = createWriteStream(targetFile);
        if (!child.stdout) {
          reject(new Error('Impossible de lire la sortie de unzip.'));
          return;
        }
        child.stdout.pipe(target);
        child.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`unzip s'est terminé avec le code ${code}`));
          }
        });
        child.on('error', reject);
      });
      return targetFile;
    }
    case 'tar.gz': {
      await runCommand('tar', ['-xzf', inputPath, '-C', outputDir]);
      const fileName = expectedName || basename(inputPath).replace(/\.tar\.gz$/, '');
      return join(outputDir, fileName);
    }
    case 'none':
      return inputPath;
    default:
      throw new Error(`Format de décompression non supporté: ${format}`);
  }
}

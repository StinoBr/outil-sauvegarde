// backend/server/utils/shellExecutor.ts

import { spawn, type ChildProcess } from 'child_process';
import { createWriteStream, WriteStream, createReadStream } from 'fs';
import { createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';

export type ShellResult = {
  success: boolean;
  error?: string;
};

// --- (Fonction 1 : executeStreamCommand - Inchangée, elle était correcte) ---
export async function executeStreamCommand(
  command: string,
  args: string[],
  outputFilePath: string,
  envVariables: NodeJS.ProcessEnv = {},
  useCompression: boolean = false
): Promise<ShellResult> {
  
  let childProcess: ChildProcess;
  try {
    childProcess = spawn(command, args, {
      env: { ...process.env, ...envVariables },
    });
  } catch (spawnError: any) {
    return { success: false, error: spawnError.message };
  }

  const fileStream: WriteStream = createWriteStream(outputFilePath);
  let stderrData = '';

  if (!childProcess.stdout) {
    fileStream.close();
    return { success: false, error: "Échec de l'initialisation de stdout." };
  }
  if (!childProcess.stderr) {
    fileStream.close();
    childProcess.kill();
    return { success: false, error: "Échec de l'initialisation de stderr." };
  }

  childProcess.stderr.on('data', (data: Buffer) => {
    stderrData += data.toString();
  });

  try {
    if (useCompression) {
      const gzipStream = createGzip();
      await pipeline(childProcess.stdout, gzipStream, fileStream);
    } else {
      await pipeline(childProcess.stdout, fileStream);
    }

    const exitCode = await new Promise<number>((resolve, reject) => {
      childProcess.on('close', resolve);
      childProcess.on('error', reject);
    });

    if (exitCode === 0) {
      return { success: true };
    } else {
      return { success: false, error: stderrData || `Processus arrêté avec code ${exitCode}` };
    }

  } catch (error: any) {
    childProcess.kill();
    return {
      success: false,
      error: `Erreur de flux: ${error.message} (stderr: ${stderrData})`,
    };
  }
}

// --- (Fonction 2 : executeStreamInCommand - CORRIGÉE) ---
export async function executeStreamInCommand(
  command: string,
  args: string[],
  inputFilePath: string,
  envVariables: NodeJS.ProcessEnv = {},
  useDecompression: boolean = false
): Promise<ShellResult> {

  let childProcess: ChildProcess;
  try {
    childProcess = spawn(command, args, {
      env: { ...process.env, ...envVariables },
    });
  } catch (spawnError: any) {
    return { success: false, error: spawnError.message };
  }

  const fileStream = createReadStream(inputFilePath);
  let stderrData = '';
  
  // --- CORRECTION : Ajout des vérifications de 'null' ---
  if (!childProcess.stdin) {
    fileStream.close();
    return { success: false, error: "Échec de l'initialisation de stdin." };
  }
  if (!childProcess.stderr) {
    fileStream.close();
    childProcess.kill();
    return { success: false, error: "Échec de l'initialisation de stderr." };
  }
  // --- Fin de la correction ---

  // Maintenant, il est sûr d'appeler .on()
  childProcess.stderr.on('data', (data: Buffer) => {
    stderrData += data.toString();
  });

  try {
    if (useDecompression) {
      const gunzipStream = createGunzip();
      // 'childProcess.stdin' est maintenant garanti de ne pas être 'null'
      await pipeline(fileStream, gunzipStream, childProcess.stdin);
    } else {
      // 'childProcess.stdin' est maintenant garanti de ne pas être 'null'
      await pipeline(fileStream, childProcess.stdin);
    }

    const exitCode = await new Promise<number>((resolve, reject) => {
      childProcess.on('close', resolve);
      childProcess.on('error', reject);
    });

    if (exitCode === 0) {
      return { success: true };
    } else {
      return { success: false, error: stderrData || `Processus arrêté avec code ${exitCode}` };
    }
  } catch (error: any) {
    childProcess.kill();
    return {
      success: false,
      error: `Erreur de flux: ${error.message} (stderr: ${stderrData})`,
    };
  }
}
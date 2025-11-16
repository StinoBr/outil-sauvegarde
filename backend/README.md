# Gestionnaire de sauvegarde multi-SGBD

Ce dossier contient l'API Nitro/Nuxt qui orchestre les sauvegardes, restaurations et la planification sur MySQL, PostgreSQL, MongoDB et SQLite. Le service expose une API REST, journalise chaque opération et prend en charge la compression (gzip, zip, tar.gz), le stockage local ainsi que l'orchestration d'envois vers AWS S3, Google Cloud Storage et Azure Blob via leurs CLI respectifs.

## Fonctionnalités

- **Sauvegardes complètes, différentielles et incrémentielles** configurables par plan.
- **Compression** sélectionnable (gzip, zip, tar.gz ou brut) et décompression automatique lors d'une restauration.
- **Cibles multiples** : MySQL/MariaDB, PostgreSQL, MongoDB, SQLite.
- **Stockage** : disque local + wrappers vers `aws`, `gsutil` et `az` (CLI) pour S3/GCS/Azure.
- **Planification** : cron jobs (node-cron) relancés automatiquement au boot Nitro.
- **API REST** : déclenchement manuel d'une sauvegarde/restauration, gestion des plans, destinations, cibles et journaux.
- **Journalisation** : heure de début/fin, durée, statut, taille, message et métadonnées de stockage dans PostgreSQL (via Prisma).
- **Restauration depuis un fichier** : possibilité de fournir un chemin personnalisé, même pour un fichier tiers.

## Architecture

```
backend/
├─ server/
│  ├─ api/              -> Routes Nitro (REST)
│  ├─ plugins/          -> Initialisation du scheduler
│  └─ src/
│     ├─ api/           -> Contrôleurs (plan, backup, restore)
│     ├─ config/        -> Configuration app/scheduler/storage
│     ├─ services/      -> BackupService, RestoreService, SchedulerService
│     ├─ strategies/    -> Stratégies SGBD (MySQL/Postgres/Mongo/SQLite)
│     └─ utils/         -> Prisma, crypto, compression, shell helpers, storage
├─ prisma/              -> Schéma & migrations (PostgreSQL)
├─ package.json         -> Dépendances Nuxt/Nitro
└─ nuxt.config.ts       -> Config Nitro + CORS pour le front React
```

### Flux d'une sauvegarde

1. `BackupService` lit le plan + destination depuis Prisma.
2. Sélection de la stratégie SGBD (`strategies/*`) qui génère la commande (mysqldump, pg_dump, mongodump, sqlite3).
3. Exécution via `utils/process` qui stream stdout vers un fichier temporaire.
4. Compression optionnelle avec `utils/compression` (gzip via Node, zip/tar via CLI `zip`/`tar`).
5. Journalisation complète + upload optionnel via `utils/storage` (utilise `aws`, `gsutil`, `az`).
6. `SchedulerService` déclenche automatiquement les plans actifs grâce aux expressions cron enregistrées.

## Prérequis

- Node.js 20+
- PostgreSQL (base applicative pour Prisma)
- Outils CLI installés si vous utilisez ces options :
  - `aws` (AWS CLI v2) pour S3
  - `gsutil` (Cloud SDK) pour Google Cloud Storage
  - `az` (Azure CLI) pour Azure Blob
  - `zip`, `unzip`, `tar`
- Binaire des SGBD cibles dans le PATH (`pg_dump`, `pg_restore`, `mysqldump`, `mysql`, `mongodump`, `mongorestore`, `sqlite3`).

## Variables d'environnement clés

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Connexion PostgreSQL utilisée par Prisma (obligatoire) |
| `BACKUP_ROOT` | Dossier racine pour stocker les archives générées |
| `SCHEDULER_ENABLED` | `true/false` pour activer la planification (défaut: true) |
| `SCHEDULER_TIMEZONE` | Fuseau horaire pour node-cron |
| `DEFAULT_COMPRESSION` | `gzip`, `zip`, `tar.gz` ou `none` |
| `ENCRYPTION_SECRET` | Clef AES-256 pour chiffrer les secrets des SGBD |
| `AWS_BUCKET`, `GCP_BUCKET`, `AZURE_STORAGE_CONTAINER`, `AZURE_STORAGE_CONNECTION_STRING` | Identifiants requis pour les uploads cloud (optionnel) |

## Mise en place locale

```bash
cd backend
cp .env.example .env         # à créer si besoin
npm install                  # installe Nuxt + Prisma (les paquets système listés ci-dessus sont fournis par l'OS)
npx prisma migrate deploy    # applique les migrations
npm run dev                  # lance l'API (http://localhost:3001)
```

Pour lancer une sauvegarde manuelle :

```bash
curl -X POST http://localhost:3001/api/backups \
  -H 'Content-Type: application/json' \
  -d '{"planId":1, "options":{"variant":"incremental","compressionFormat":"zip"}}'
```

Pour restaurer :

```bash
curl -X POST http://localhost:3001/api/restores \
  -H 'Content-Type: application/json' \
  -d '{"journalId":12, "options":{"compressionFormat":"gzip"}}'
```

## Docker Compose de démonstration

Le fichier `docker-compose.yml` lance :

- `backend` (Node 20 + Nitro) avec hot-reload, connecté à la base `postgres_app`
- `postgres_app` (base Prisma)
- Trois SGBD cibles pour vos tests : `mysql_target`, `postgres_target`, `mongo_target`

```bash
docker compose up -d
# puis consultez http://localhost:3001/api/plans
```

Les données de sauvegarde sont stockées dans le volume `backups_data` (monté dans `/app/.data/backups`).

## API REST principale

| Méthode | Route | Description |
| --- | --- | --- |
| `GET /api/plans` | Liste les plans + relations |
| `POST /api/plans` | Crée un plan (nom, cron, SGBD, destination, type de sauvegarde) |
| `POST /api/plans/:id/execute` | Déclenche une sauvegarde pour un plan donné |
| `GET /api/journals` | Journal complet des sauvegardes |
| `POST /api/backups` | Déclenchement générique (planId + options) |
| `POST /api/restores` | Restauration depuis un journal (ou chemin custom) |
| `POST /api/restore/:id` | Alias historique pour lancer une restauration |
| `GET/POST /api/sgbd-targets` | CRUD simplifié des cibles de sauvegarde |
| `GET/POST /api/destinations` | CRUD des destinations locales/cloud |

Chaque endpoint retourne immédiatement après avoir planifié le job pour éviter le timeout côté client.

## Tests & journalisation

- Les journaux détaillés sont enregistrés dans PostgreSQL (tables `JournalSauvegarde` et `JournalRestauration`).
- `server/src/utils/logger.ts` fournit un logger minimaliste basé sur `console` (et n'affiche le debug qu'en développement).

## Améliorations possibles

1. **File d'attente distribuée** (BullMQ, RabbitMQ) pour répartir les sauvegardes sur plusieurs workers.
2. **Détection automatique des binaires** (pg_dump, mysqldump, etc.) selon l'OS, avec fallback Docker.
3. **Observabilité** : exporter des métriques Prometheus (durée moyenne, taux d'échec, taille).
4. **Chiffrement côté serveur** des fichiers générés (GPG) avant envoi cloud.
5. **Support multi-régions** pour le stockage cloud en cascade (S3 + GCS).
6. **Interface temps réel** (WebSocket) pour suivre la progression d'un dump volumineux.
7. **Rotation intelligente** : suppression automatique des N-anciennes sauvegardes par plan.

## Commandes utiles

```bash
# Lint Prisma
npx prisma format

# Vérifier les plans actifs via Prisma Studio
npx prisma studio

# Relancer uniquement le scheduler (ex: après une MAJ de plan)
npx nuxi dev --dotenv --clear-cache
```

> 💡 Pensez à référencer les binaires `pg_dump`, `pg_restore`, `mysqldump`, `mysql`, `mongodump`, `mongorestore`, `sqlite3`, `zip`, `tar`, `unzip`, `aws`, `gsutil` et `az` dans votre PATH ou à mettre à jour les variables d'environnement correspondantes.

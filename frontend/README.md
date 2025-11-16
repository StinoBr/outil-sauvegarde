# Atlas Backup UI

Interface React professionnelle permettant d'orchestrer les sauvegardes/restaurations des SGBD gérées par le backend `outil-sauvegarde`.

## Stack & Design System

- **React + React Router** : navigation par pages (dashboard, backups, restore, logs, settings, databases)
- **Tailwind-like design system** : jeu d'utilitaires et de tokens (`src/styles`) compilé dans le repo pour éviter toute dépendance externe
- **State management** : store inspiré de Zustand (`src/store`) avec actions asynchrones pour le polling, les backups/restores et la configuration
- **API client** : `fetch` + mocks (`src/services`) pour consommer les endpoints du backend (`/backup`, `/restore`, `/logs`, `/databases`, `/status`, `/settings/*`)
- **UI Components** : layout complet (Sidebar + Topbar), cartes, tableaux, badges, boutons, modales… adaptés au mode clair/sombre

## Arborescence

```
src/
├── app/
│   ├── backup
│   ├── dashboard
│   ├── databases
│   ├── logs
│   ├── restore
│   └── settings
├── components/
├── hooks/
├── lib/
├── services/
├── store/
└── styles/
```

Chaque page consomme les hooks/stores pour déclencher les actions backend (ex : `triggerBackup`, `fetchLogs`, `updateSchedule`).

## Lancer le frontend

```bash
cd frontend
npm install   # (une fois les dépendances déjà présentes)
npm start
```

Le serveur démarre sur [http://localhost:3000](http://localhost:3000).

> ℹ️ Les endpoints backend sont configurés via `REACT_APP_API_BASE_URL`. En absence de backend, les services tombent automatiquement sur des mocks réalistes (`services/mockData`).

## Tests rapides

```bash
npm run build    # vérifie la compilation CRA
npm test         # tests unitaires CRA par défaut
```

## Améliorations UI/UX proposées

1. **Notifications temps-réel** : brancher un flux SSE/websocket pour mettre à jour les jobs sans polling.
2. **Audit détaillé** : ajouter une vue Timeline par base avec comparaison des durées/taille de sauvegarde.
3. **Playbooks restauration** : wizard en 3 étapes (choix snapshot → validation → monitoring) avec suivi de pourcentage.
4. **Multi-tenancy** : tags d'environnement (Prod/Preprod/Dev) directement filtrables dans la sidebar.
5. **Accessibilité** : intégrer un thème high-contrast et navigation clavier complète sur les tables/logs.

## Notes

- Le design system (`styles/design-system.css` & `styles/utilities.css`) reprend une nomenclature Tailwind pour faciliter l'évolution vers un build Tailwind complet.
- Le store maison expose la même ergonomie qu'un store Zustand (`createStore`), ce qui facilitera la migration si la dépendance peut être installée plus tard.

# Stack technique — Voice Simple

## Frontend
- Framework: React + TypeScript (Vite)
- WebRTC via API native (`RTCPeerConnection`)
- Signalisation: socket.io-client (WebSocket)
- Audio: Web Audio API pour VAD (voice activity detection)
- UI: Tailwind CSS
- State: Zustand (léger)

## Backend (signalisation)
- Runtime: Node.js (LTS)
- Framework: Fastify (ou Express) + socket.io
- Rôle: échange SDP/ICE, gestion des salons/présence, auth
- Pas de stockage audio côté serveur

## Base de données
- PostgreSQL (utilisateurs, serveurs, salons) — ou SQLite en dev
- ORM: Prisma

## Infra / déploiement
- Docker + docker-compose
- Reverse proxy: Caddy (HTTPS auto, requis pour getUserMedia)
- Coturn (TURN) optionnel pour NAT difficile

## Architecture audio
- MVP: maillage P2P (mesh) jusqu'à ~4-6 participants
- V2: SFU (mediasoup ou LiveKit) si besoin de plus

## Outils
- Package manager: pnpm (workspaces: client/, server/, shared/)
- Lint/format: ESLint + Prettier
- Tests: Vitest (client), node:test ou Jest (server)
- CI: GitHub Actions (lint + typecheck + tests)

## Ports
- Client dev: 5173
- Server: 3000
- Postgres: 5432

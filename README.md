# A2A Registry UI

React/Vite dashboard for discovering and administering agents registered with
`a2a-registry-server`.

## Development

Requirements: Node.js 22 or newer. Start the registry server on port 3003, then:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The development server proxies `/v1` and
`/health` to `http://localhost:3003`.

For a remotely hosted registry, copy `.env.example` to `.env` and set
`VITE_REGISTRY_API_URL`. `VITE_REGISTRY_WRITE_TOKEN` is optional and grants the
UI administrative access when the server is configured with a matching token.

## Build

```bash
npm run check
npm run build
npm run preview
```


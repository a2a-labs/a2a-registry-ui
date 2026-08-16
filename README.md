# A2A Registry UI

React/Vite dashboard for discovering logical agents and inspecting their active
runtime instances in `a2a-registry-server` 0.2 and later.

The UI is intentionally read-only. Registration, instance lease ownership,
heartbeats, and unregistration remain agent/operator API responsibilities.

## Development

Requirements: Node.js 22 or newer. Start the registry server on port 3003, then:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The development server proxies `/v1` and
`/health` to `http://localhost:3003`.

For a remotely hosted registry, copy `.env.example` to `.env` and set
`VITE_REGISTRY_API_URL`.

The agent table counts logical agents. Selecting an agent opens its shared Agent
Card details and every active instance, including the instance ID, endpoint,
status, last heartbeat, lease expiry, and published location metadata.

## Build

```bash
npm run check
npm run build
npm run preview
```

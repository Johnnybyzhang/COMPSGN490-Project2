# Presenter & Collaboration Guide

The GOOS Dashboard was designed to support classroom storytelling where one person narrates while another adjusts filters in real time. This guide explains how to run the `/controls` experience locally and what is required to enable shared control across multiple devices.

## Local Presenter Controls

1. Start the dev server (`npm run dev`) or serve the production build (`npm run preview`).
2. Open the main dashboard at `http://localhost:5173/` (replace with the URL printed by Vite).
3. In another browser tab or device, visit `http://localhost:5173/controls`.
4. Adjust any of the controls:
   - **Region selector** – Chooses which ocean appears in the watchlist and summary pill.
   - **Year slider** – Moves the simulated timeline between 2038 and 2042.
   - **Scenario dropdown** – Switches between Baseline, Mitigation, and Rapid Expansion narratives.
   - **Randomize Mock Data** – Regenerates the dataset by updating the pseudo-random seed.
   - **Theme toggle** – Switches between dark and light palettes.

All changes immediately reflect on the main dashboard because both routes share the same React state inside `<App />`.

## Live Synchronisation (Optional)

For multi-device presentations (e.g., instructor laptop driving a projector, student tablet adjusting filters), the app can synchronise state using Server-Sent Events (SSE) and a lightweight POST endpoint.

### Required Endpoints

| Endpoint | Method | Purpose | Expected Payload |
| --- | --- | --- | --- |
| `/api/stream` | SSE | Broadcasts remote updates to each dashboard. | Each message contains JSON such as `{ "filters": { ... }, "variant": 123, "theme": "dark", "timestamp": "2024-04-22T18:32:11.812Z" }`. Events are emitted as either `update` or `sync`. |
| `/api/controls` | POST | Receives local changes and rebroadcasts them to other clients. | Request body is JSON with the same shape as above. Servers can push it to connected SSE clients. |

The repository ships only the front-end; implementing these endpoints is left to the deployment environment. Example options include:

- A small Node/Express or Fastify service that stores the latest payload in memory and rebroadcasts it.
- A serverless function (Netlify, Vercel, Cloudflare Workers) that relays messages via durable objects or an in-memory channel.

### Connection Lifecycle

- On mount, the app feature-detects `EventSource`. If unavailable, the live indicator reads `Live feed · unsupported` and no network calls are made.
- When available, the app subscribes to `/api/stream` and sets the live indicator to `connecting`, then `connected` upon success.
- Incoming messages call `applyRemoteUpdate`, update React state, and temporarily disable outbound broadcasts to avoid infinite loops.
- Network errors mark the indicator as `reconnecting…` and retry the SSE connection after 5 seconds.
- Local state changes (`filters`, `variant`, `theme`) issue a background POST to `/api/controls` unless the change originated from a remote message.

### Status Pills

The live indicator in the top bar communicates connection health:

| Status Class | Label | Meaning |
| --- | --- | --- |
| `idle` | `Live feed · idle` | Default before any connection attempt. |
| `connecting` | `Live feed · connecting…` | Opening the SSE connection. |
| `connected` | `Live feed · connected` or timestamp | Streaming updates successfully. |
| `disconnected` | `Live feed · reconnecting…` | Connection dropped; retry scheduled. |
| `unsupported` | `Live feed · unsupported` | Browser lacks SSE support (common on very old or embedded browsers). |

## Presentation Tips

- Share the `/controls` URL with the presenter while keeping `/` on the primary display.
- Use the scenario blurb and quick tips (right-hand panel on `/controls`) to guide narration.
- Tap "Randomize Mock Data" between segments to keep the audience engaged with new numbers while preserving coherent trends.
- Toggle the theme to highlight how the design adapts to different lighting conditions (useful for accessibility discussions).
- Remind the audience that the data is fictional; both the top bar and footer reiterate this message.

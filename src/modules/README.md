# Modules (Foundation 001 §4.2)

One directory per Architecture §6 module of the modular monolith. Boundary rules (§4.3):
a module imports another only through that module's `index.ts`; modules import
`src/platform/ports` and `src/platform/events` but never `src/platform/adapters`; only
`src/app` selects adapters. `scripts`: `npm run boundary:check`.

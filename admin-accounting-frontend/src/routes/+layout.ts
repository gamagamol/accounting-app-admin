// This is an admin dashboard that reads browser-only state (localStorage,
// window.matchMedia) and uses Svelte 4 legacy stores. Render it as a client
// application so adapter-node serves the shell and the app hydrates in the
// browser instead of attempting SSR with browser-only code.
export const ssr = false;
export const prerender = false;

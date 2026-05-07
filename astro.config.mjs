// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import EventEmitter from "node:events";

// Increase the limit for the global event emitter
// This will prevent the MaxListenersExceededWarning
EventEmitter.defaultMaxListeners = 20;

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [svelte()],
});

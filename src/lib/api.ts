import { treaty } from "@elysia/eden";
import type { App } from "@/api/elysia";

export const { api } = treaty<App>("http://localhost:4321");
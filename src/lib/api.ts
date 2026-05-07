import { treaty } from "@elysia/eden";
import type { App } from "@/api/elysia";

const url = import.meta.env.PROD 
  ? "https://www.aryareal.my.id" 
  : "http://localhost:4321";

export const { api } = treaty<App>(url);

import { Elysia, redirect } from "elysia";
import openapi from "@elysia/openapi";

export const app = new Elysia({ prefix: "/api" })
  .use(
    openapi({
      path: "/docs",
      documentation: {
        info: {
          title: "AryaReal's Portfolio API",
          version: "0.0.1",
          description: `The **AryaReal's Portfolio API** is an API that is used to store and retrieve information about my projects, experiences, and skills.\n\nThis API is used in [my portfolio website](https://aryareal.my.id).`,
          contact: {
            name: "Arya Dwiputra",
            email: "aryadwiputra193@gmail.com",
            url: "https://aryareal.my.id",
          },
        },
      },
    }),
  )
  .get("/", () => redirect("docs"), { detail: { hide: true } });

export type App = typeof app;

export default app;

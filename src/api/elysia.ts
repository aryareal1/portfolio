import Elysia, { t } from "elysia";

// Simple in-memory storage for RSVPs
const rsvps = [
  { name: "Admin", message: "Can't wait to see you all!" }
];

export const app = new Elysia({ prefix: "/api" })
  .get("/traktiran", () => rsvps)
  .post("/traktiran", ({ body }) => {
    const { name, "kata-kata": kataKata } = body as { name: string, "kata-kata": string };
    rsvps.push({ name, message: kataKata });
    return { success: true };
  }, {
    body: t.Object({
      name: t.String(),
      "kata-kata": t.String()
    })
  });

export type App = typeof app;

export default app;


import Elysia, { t } from "elysia";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccount) {
    try {
      initializeApp({
        credential: cert(JSON.parse(serviceAccount)),
      });
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", err);
      initializeApp();
    }
  } else {
    initializeApp();
  }
}

const db = getFirestore();
const rsvpDoc = db.collection("traktiran").doc("rsvp");

export const app = new Elysia({ prefix: "/api" })
  .get(
    "/traktiran",
    async () => {
      const doc = await rsvpDoc.get();
      if (!doc.exists) return [];
      const guests = (doc.data()?.guests || []).reverse();
      
      // Handle legacy data that doesn't have uId or replies
      return guests.map((g: any) => ({
        ...g,
        uId: g.uId || `legacy-${g.createdAt}`,
        replies: g.replies || []
      }));
    },
    {
      response: {
        200: t.Array(
          t.Object({
            uId: t.Optional(t.String()),
            name: t.String(),
            message: t.Optional(t.String()),
            createdAt: t.String(),
            replies: t.Optional(
              t.Array(
                t.Object({
                  message: t.String(),
                  createdAt: t.String(),
                }),
              ),
            ),
          }),
        ),
      },
    },
  )

  .post(
    "/traktiran",
    async ({ body }) => {
      const { name, "kata-kata": kataKata } = body as {
        name: string;
        "kata-kata": string;
      };

      await rsvpDoc.set(
        {
          guests: FieldValue.arrayUnion({
            uId: Math.random().toString(36).substring(2, 15),
            name,
            message: kataKata,
            createdAt: new Date().toISOString(),
            replies: []
          }),
        },
        { merge: true },
      );

      return { success: true };
    },
    {
      body: t.Object({
        name: t.String(),
        "kata-kata": t.String(),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
        }),
      },
    },
  )
  .post(
    "/traktiran/reply",
    async ({ body, headers, set }) => {
      const apiKey = headers["x-api-key"];
      if (!apiKey || apiKey !== process.env.ADMIN_XKEY) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const { uId, message } = body;

      const doc = await rsvpDoc.get();
      if (!doc.exists) {
        set.status = 404;
        return { error: "Document not found" };
      }

      const data = doc.data();
      const guests = data?.guests || [];
      const guestIndex = guests.findIndex((g: any) => {
        const currentUId = g.uId || `legacy-${g.createdAt}`;
        return currentUId === uId;
      });


      if (guestIndex === -1) {
        set.status = 404;
        return { error: "Guest not found" };
      }

      // Update the specific guest's replies
      if (!guests[guestIndex].replies) guests[guestIndex].replies = [];
      guests[guestIndex].replies.push({
        message,
        createdAt: new Date().toISOString()
      });

      await rsvpDoc.update({ guests });

      return { success: true };
    },
    {
      body: t.Object({
        uId: t.String(),
        message: t.String()
      }),
      headers: t.Object({
        "x-api-key": t.Optional(t.String())
      })
    }
  );

export type App = typeof app;


export default app;

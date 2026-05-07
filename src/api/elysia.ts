import Elysia, { t } from "elysia";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (serviceAccount) {
    try {
      initializeApp({
        credential: cert(JSON.parse(serviceAccount))
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
  .get("/traktiran", async () => {
    const doc = await rsvpDoc.get();
    if (!doc.exists) return [];
    return (doc.data()?.guests || []).reverse();
  })
  .post("/traktiran", async ({ body }) => {
    const { name, "kata-kata": kataKata } = body as { name: string, "kata-kata": string };
    
    await rsvpDoc.set({
      guests: FieldValue.arrayUnion({
        name,
        message: kataKata,
        createdAt: new Date().toISOString()
      })
    }, { merge: true });
    
    return { success: true };
  }, {
    body: t.Object({
      name: t.String(),
      "kata-kata": t.String()
    })
  });



export type App = typeof app;

export default app;


import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export type FirebaseAdminApp = admin.app.App;

export type EventContext = functions.EventContext;
export type HttpRequest = functions.Request;
export type HttpResponse = functions.Response;
export type CallableContext = functions.https.CallableContext;

export type Firestore = admin.firestore.Firestore;
export type DocumentReference = admin.firestore.DocumentReference;
export type DocumentSnapshot = admin.firestore.DocumentSnapshot;
export type QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot;
export type DocumentChange = functions.Change<DocumentSnapshot>;
export type Timestamp = admin.firestore.Timestamp;

export const Timestamp = admin.firestore.Timestamp;
export const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;
export const arrayUnion = admin.firestore.FieldValue.arrayUnion;
export const arrayRemove = admin.firestore.FieldValue.arrayRemove;
export const fieldDelete = admin.firestore.FieldValue.delete;

export type Notification = admin.messaging.Notification;
export type MulticastMessage = admin.messaging.MulticastMessage;

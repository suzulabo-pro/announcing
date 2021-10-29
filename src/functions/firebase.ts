import { firestore, messaging } from 'firebase-admin';
import { App } from 'firebase-admin/app';
import * as functions from 'firebase-functions';

export type FirebaseAdminApp = App;

export type EventContext = functions.EventContext;
export type HttpRequest = functions.Request;
export type HttpResponse = functions.Response;
export type CallableContext = functions.https.CallableContext;

export type Firestore = firestore.Firestore;
export type DocumentReference = firestore.DocumentReference;
export type DocumentSnapshot = firestore.DocumentSnapshot;
export type QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;
export type DocumentChange = functions.Change<DocumentSnapshot>;
export type Timestamp = firestore.Timestamp;
export type Transaction = firestore.Transaction;

export const Timestamp = firestore.Timestamp;
export const serverTimestamp = firestore.FieldValue.serverTimestamp;
export const arrayUnion = firestore.FieldValue.arrayUnion;
export const arrayRemove = firestore.FieldValue.arrayRemove;
export const fieldDelete = firestore.FieldValue.delete;

export type PubSubMessage = functions.pubsub.Message;

export type Notification = messaging.Notification;
export type MulticastMessage = messaging.MulticastMessage;
export type BatchResponse = messaging.BatchResponse;

export { initializeApp } from 'firebase-admin/app';
export { getFirestore } from 'firebase-admin/firestore';
export { getMessaging } from 'firebase-admin/messaging';

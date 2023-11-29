import {CollectionPath, setWithBatchAsync} from "./firestore-service";
import {
    BoardingAppointmentData,
    DaycareAppointmentData
} from "../models";
import { firestore } from "firebase-admin";
import Firestore = firestore.Firestore;
import DocumentReference = firestore.DocumentReference;
import WriteBatch = firestore.WriteBatch;

const daycareRef = (db: Firestore, item: any): DocumentReference<any> => db.collection(CollectionPath.DaycareAppointment).doc(item.id);
const dayCareSetObject = (item: DaycareAppointmentData): any => item;

const boardingRef = (db: Firestore, item: any): DocumentReference<any> => db.collection(CollectionPath.BoardingAppointment).doc(item.id);
const boardingSetObject = (item: BoardingAppointmentData): any => item;

export const setDaycareAppointment = (data: DaycareAppointmentData) => (batch: WriteBatch) =>
    setWithBatchAsync([data], daycareRef, dayCareSetObject, batch)

export const setBoardingAppointment = (data: BoardingAppointmentData) => (batch: WriteBatch) =>
    setWithBatchAsync([data], boardingRef, boardingSetObject, batch)





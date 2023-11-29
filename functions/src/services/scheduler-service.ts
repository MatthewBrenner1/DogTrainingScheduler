import {executeBatch} from "./firestore-service";
import { firestore } from "firebase-admin";
import WriteBatch = firestore.WriteBatch;
import {IResult} from "../result/result";


export const updateCapacityAndSetAppointment = async (updateCapacityFn: (batch: WriteBatch) => Promise<IResult<any>>, setAppointmentFn: (batch: WriteBatch) => any): Promise<IResult<any>> =>
    executeBatch((batch: WriteBatch) =>
        updateCapacityFn(batch)
            .then(r => r.map(() => setAppointmentFn(batch))));

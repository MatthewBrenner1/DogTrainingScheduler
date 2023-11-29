import {firestore} from "firebase-admin";
import WriteBatch = firestore.WriteBatch;
import {getDb} from "../index";
import {ErrorResult, IResult, SuccessResult} from "../result/result";
import Firestore = firestore.Firestore;
import DocumentReference = firestore.DocumentReference;
import {ErrorMessages} from "../result/error-messages";
import {handleExceptions} from "../result/exception-handler";


export enum CollectionPath {
    UserInformation = 'UserInformation',
    ScheduleCapacity = 'ScheduleCapacity',
    DaycareAppointment = 'DaycareAppointment',
    BoardingAppointment = 'BoardingAppointment',
    WhitelistedEmails = 'WhitelistedEmails',
    FailedGoogleCalendarEvents = 'FailedGoogleCalendarEvents',
}

export const executeBatch = async (fn: (batch: WriteBatch) => Promise<IResult<any>>): Promise<IResult<any>> => {
    const batch = getDb().batch();
    const result = fn(batch);

    return result.then(r => r.map(() => commitBatch(batch)));
}

export const startBatch = (db: Firestore): IResult<WriteBatch> =>
    handleExceptions(() => new SuccessResult<WriteBatch>(db.batch()), ErrorMessages.StartBatch);

export const updateWithBatch = <T>(items: T[], getRefFn: (db: Firestore, item: any) => DocumentReference<any>, getUpdateObjFn: (item: any) => any, batch: WriteBatch): IResult<WriteBatch> =>
    handleExceptions(() => {
        items.forEach(item => batch.update(getRefFn(getDb(), item), getUpdateObjFn(item)));
        return new SuccessResult<any>(batch);
    }, ErrorMessages.UpdateBatch)

export const updateWithBatchAsync = async <T>(items: T[], getRefFn: (db: Firestore, item: any) => DocumentReference<any>, getUpdateObjFn: (item: any) => any, batch: WriteBatch): Promise<IResult<WriteBatch>> =>
    handleExceptions(() => {
        items.forEach(item => batch.update(getRefFn(getDb(), item), getUpdateObjFn(item)));
        return new SuccessResult<any>(batch);
    }, ErrorMessages.UpdateBatch)

export const setWithBatch = <T>(items: T[], getRefFn: (db: Firestore, item: any) => DocumentReference<any>, getUpdateObjFn: (item: any) => any, batch: WriteBatch): IResult<WriteBatch> =>
    handleExceptions(() => {
        items.forEach(item => batch.set(getRefFn(getDb(), item), getUpdateObjFn(item)));
        return new SuccessResult<any>(batch);
    }, ErrorMessages.SetBatch)

export const setWithBatchAsync = async <T>(items: T[], getRefFn: (db: Firestore, item: any) => DocumentReference<any>, getUpdateObjFn: (item: any) => any, batch: WriteBatch): Promise<IResult<WriteBatch>> =>
    handleExceptions(() => {
        items.forEach(item => batch.set(getRefFn(getDb(), item), getUpdateObjFn(item)));
        return new SuccessResult<any>(batch);
    }, ErrorMessages.SetBatch)

export const commitBatch = (batch: WriteBatch): Promise<IResult<any>> =>
    batch.commit()
        .then((batch) => new SuccessResult<any>(batch))
        .catch((error: any) => new ErrorResult<any>(ErrorMessages.CommitBatch, error));

export const executeBatchUpdate = <T>(items: T[], getRefFn: (db: Firestore, item: any) => DocumentReference<any>, getUpdateObjFn: (item: any) => any): Promise<IResult<T[]>> =>
     startBatch(getDb())
        .map((batch) =>
            updateWithBatch<T>(items, getRefFn, getUpdateObjFn, batch)
                .map((batch) => commitBatch(batch)))
         .then((result) => result.map(() => Promise.resolve(new SuccessResult<T[]>(items))));

export const executeBatchSet = <T>(items: T[], getRefFn: (db: Firestore, item: any) => DocumentReference<any>, getUpdateObjFn: (item: any) => any): Promise<IResult<T[]>> =>
    startBatch(getDb())
        .map((batch) =>
            setWithBatch<T>(items, getRefFn, getUpdateObjFn, batch)
                .map((batch) => commitBatch(batch)))
        .then((result) => result.map(() => Promise.resolve(new SuccessResult<T[]>(items))));

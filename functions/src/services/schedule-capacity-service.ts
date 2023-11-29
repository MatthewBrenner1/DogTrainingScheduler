import { ScheduleCapacity, UpdateScheduleCapacity} from "../models";
import {
    CollectionPath, executeBatchSet,
    updateWithBatchAsync
} from "./firestore-service";
import {ErrorResult, IResult, SuccessResult, ValidationErrorResult} from "../result/result";
import { firestore } from "firebase-admin";
import QuerySnapshot = firestore.QuerySnapshot;
import DocumentData = firestore.DocumentData;
import WriteBatch = firestore.WriteBatch;
import DocumentReference = firestore.DocumentReference;
import Firestore = firestore.Firestore;
import {handleExceptions} from "../result/exception-handler";
import {fold} from "../result/result-extensions";
import {ErrorMessages} from "../result/error-messages";
import {getDb} from "../index";
import {getDataAndIdFromDoc, getDaysArray, getYearMonthDayFormatFromDate} from "../utilities";

const updateScheduleCapacityRef = (db: Firestore, item: UpdateScheduleCapacity): DocumentReference<any> => db.collection(CollectionPath.ScheduleCapacity).doc(item.id);
const occupancyUpdateObject = (item: UpdateScheduleCapacity): any => { return { 'currentOccupancy': Number(item.currentOccupancy) + Number(item.numberOfDogs) };}
const maxCapacityUpdateObject = (item: ScheduleCapacity): any => { return { ...item, 'maxCapacity': Number(item.maxCapacity) };}

export const updateOccupancy = (currentScheduleCapacities: ScheduleCapacity[], data: any) => (batch: WriteBatch) =>
        validateOccupancyDoesNotExceedMaxCapacity(data.dogData.length, currentScheduleCapacities)
            .then(r => r.map(scheduleCapacities => convertToUpdateCapacityObjects(data.dogData.length, scheduleCapacities)))
            .then(r => r.map(updateCapacity => updateWithBatchAsync(updateCapacity, updateScheduleCapacityRef, occupancyUpdateObject, batch)))

const convertToUpdateCapacityObjects = async (numberOfDogs: number, scheduleCapacities: ScheduleCapacity[]): Promise<IResult<UpdateScheduleCapacity[]>> =>
    new SuccessResult(scheduleCapacities.map(x => { return {...x, numberOfDogs: numberOfDogs}}));

const validateOccupancyDoesNotExceedMaxCapacity = async (numberOfDogs: number, scheduleCapacities: ScheduleCapacity[]): Promise<IResult<ScheduleCapacity[]>> =>
    handleExceptions(() =>
            fold<ScheduleCapacity, boolean>(true, doesNotExceedsCapacity(numberOfDogs), scheduleCapacities)
                ? new SuccessResult(scheduleCapacities):
                new ValidationErrorResult(ErrorMessages.ValidateOccupancyLevels),
        ErrorMessages.ValidateOccupancyLevels)

const doesNotExceedsCapacity = (numberOfDogs: number) => ( scheduleCapacity: ScheduleCapacity, currentValue: boolean): boolean =>
    (!((scheduleCapacity.currentOccupancy + numberOfDogs) > scheduleCapacity.maxCapacity) && currentValue);

export const createOrUpdateMaxCapacity = (getCapacityFn: (items: any) => Promise<IResult<ScheduleCapacity[]>>, newMaxCapacity: number, startAndEndDate: any): Promise<IResult<ScheduleCapacity[]>> =>
    getCapacityFn(startAndEndDate)
        .then(r => r.map(scheduleCapacity => validateOccupancyDoesNotExceedNewMaxCapacity(newMaxCapacity, scheduleCapacity)))
        .then(r => r.map(scheduleCapacities => setNewMaxCapacityOnScheduleCapacities(newMaxCapacity, scheduleCapacities, startAndEndDate)))
        .then(r => r.map(updatedScheduleCapacities => executeBatchSet<ScheduleCapacity>(updatedScheduleCapacities, updateScheduleCapacityRef, maxCapacityUpdateObject)));

const validateOccupancyDoesNotExceedNewMaxCapacity = async (newMaxCapacity: number, scheduleCapacities: ScheduleCapacity[]): Promise<IResult<ScheduleCapacity[]>> =>
    {
        return handleExceptions(() =>
                fold<ScheduleCapacity, boolean>(true, doesNotExceedNewMaxCapacity(newMaxCapacity), scheduleCapacities)
                    ? new SuccessResult(scheduleCapacities):
                    new ValidationErrorResult(ErrorMessages.ValidateOccupancyLevels),
            ErrorMessages.ValidateOccupancyLevels);
    }


const setNewMaxCapacityOnScheduleCapacities = async (newMaxCapacity: number, scheduleCapacities: ScheduleCapacity[], startAndEndDate: any): Promise<IResult<ScheduleCapacity[]>> =>
    handleExceptions(() =>
     new SuccessResult(
         getDaysArray(startAndEndDate.startDateString, startAndEndDate.endDateString)
        .map((day: Date) => {
            day.setHours(12,0,0);
            const existingDate = scheduleCapacities.find(x => x.scheduleDateEpochTime === day.getTime());
            if (existingDate){
                return { ...existingDate, maxCapacity: newMaxCapacity}
            }
            return {
                id: getYearMonthDayFormatFromDate(day),
                maxCapacity: newMaxCapacity,
                currentOccupancy: 0,
                scheduleDateEpochTime: day.getTime(),
            }
        })), ErrorMessages.SetNewMaxCapacityOnScheduleCapacities);

const doesNotExceedNewMaxCapacity = (newMaxCapacity: number) => ( scheduleCapacity: ScheduleCapacity, currentValue: boolean): boolean =>
    (!((scheduleCapacity.currentOccupancy) > newMaxCapacity) && currentValue);


export async function getCapacityBetweenStartAndEndDate(dates: {startDateString: string, endDateString: string}): Promise<IResult<ScheduleCapacity[]>>{
    const startDate = new Date(dates.startDateString);
    startDate.setHours(12, 0,0);
    const endDate = new Date(dates.endDateString);
    endDate.setHours(12, 0,0);
    console.log('GOT HERE DATES: ', dates);
    return getDb().collection(CollectionPath.ScheduleCapacity)
        .where('scheduleDateEpochTime', '>=', startDate.getTime())
        .where('scheduleDateEpochTime', '<=', endDate.getTime())
        .get()
        .then((result: QuerySnapshot<DocumentData>) => getDataAndIdFromDoc(result))
        .catch((error: any) => new ErrorResult<any>(ErrorMessages.ExecuteGetForBoarding, error))
}

// export async function setMaxCapacity(db: Firestore, startDateString: string, endDateString: string, newMaxCapacity: number): Promise<IResult<any>>{
//     const startDate = setDateToCorrectTimeFromString(startDateString);
//     const endDate = setDateToCorrectTimeFromString(endDateString);
//     // const scheduleCapacityRef = db.collection('ScheduleCapacity');
//     getDaysArray(startDate, endDate);
//     //     .forEach(dateToBeInserted => {
//     //         const dateTimeToBeInserted = updateDatesToCorrectTime(dateToBeInserted)
//     //         const newDateId = dateTimeToBeInserted.toISOString().slice(0, 10)
//     //         const newDateRef = scheduleCapacityRef.doc(newDateId);
//     //         // functions.logger.info(`Inserting: scheduleDate ${newDateId},  scheduleDateEpochTime: ${dateTimeToBeInserted}`
//     //         //     , {structuredData: true});
//     //         newDateRef.set(
//     //             {
//     //                 "scheduleDate": newDateId,
//     //                 "currentOccupancy": 0,
//     //                 "maxCapacity": 15,
//     //                 "scheduleDateEpochTime": dateTimeToBeInserted.getTime()
//     //             });
//     // })
//
//
// }



// export async function setDefaultMaxCapacityPerMonth(db: Firestore, startDate: any, endDate: any, newMaxCapacity: number): Promise<IResult<any>> {}



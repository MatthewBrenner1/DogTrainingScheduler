import {IResult, SuccessResult} from "./result/result";
import {handleExceptions} from "./result/exception-handler";
import {ErrorMessages} from "./result/error-messages";
import {firestore} from "firebase-admin";
import QuerySnapshot = firestore.QuerySnapshot;
import DocumentData = firestore.DocumentData;
const crypto = require("crypto");

export function getDaysArray(start: any, end: any) {
    for(var arr=[],dt=new Date(start); dt<=new Date(end); dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt));
    }
    return arr;
}

export function updateDatesToCorrectTime(date: Date){
    date.setHours(12,0,0);
    return date;
}

export function setDateToCorrectTimeFromString(dateString: string){
    const date = new Date(dateString);
    date.setHours(12,0,0);
    return date;
}

export const getEpochDateTimes = (dates: string[]): IResult<number[]> =>
    handleExceptions<number[]>(() =>
        new SuccessResult(dates.map(dateString => {
            const date = new Date(dateString);
            date.setHours(12, 0,0);
            return date.getTime();
        })), ErrorMessages.GetEpochDateTimes);

export const getDataAndIdFromDoc = (query: QuerySnapshot<DocumentData>): IResult<any[]> =>
    handleExceptions(() =>
            new SuccessResult<any>(query.docs.map(data => {
                return { ...data.data(), id: data.id }
            })),
        ErrorMessages.GetDataAndIdFromDoc);


export function getYearMonthDayFormatFromDate(date: Date){
    return date.getFullYear() +
        "-" +
        ("00" + (date.getMonth() + 1)).slice(-2) +
        "-" +
        ("00" + date.getDate()).slice(-2);

}

export function generateUuid(){
    return crypto.randomBytes(16).toString("hex");
}

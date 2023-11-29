import {ErrorResult, IResult, SuccessResult, SuccessWithWarningResult} from "./result";
import * as functions from "firebase-functions";
// import * as functions from "firebase-functions";

export const reduceToSuccessWithWarningResultIfAny = <T, TResult = T>(list: T[]): IResult<TResult> => fold<T, IResult<TResult>>(new SuccessResult<any>({}), containsResult(SuccessWithWarningResult), list);
export const reduceToErrorResultIfAny = <T, TResult = T>(list: T[]) => fold<T, IResult<TResult>>(new SuccessResult<any>({}), anyErrorResults, list);

export const anyErrorResults = (currentValue: any, accumulatedValue: any) => containsResult(ErrorResult);
export const anySuccessWithWarningResults = <T>(currentValue: IResult<T>, accumulatedValue: IResult<T>) => containsResult(SuccessWithWarningResult);

export const containsResult = <T>(result: any) => (currentValue: any, accumulatedValue: any) => {
    let value = accumulatedValue;
    if (value instanceof result){
        return value;
    }
    if (currentValue instanceof result){
        return currentValue;
    }
    return value;
}

export const fold = <T, TResult>(identity: any, operation: (currentValue: any, accumulatedValue: any) => any, list: T[]): TResult => {
    let accumulatedValue = identity;
    for (const current of list) {
        accumulatedValue = operation(current, accumulatedValue);
    }
    return accumulatedValue;
};

export const getSuccessResponse = (data: any) => {
    return {isSuccess: true, data: data}
}

export const getFailureResponse = (message: string, exception: any) => {
    const exceptionMessage = exception?.message ? ' ' + exception.message : '';
    functions.logger.error(`${message}${exceptionMessage}`, {structuredData: true});
    return { isSuccess: false, errors: {message: message}, data: [] }
}

export const logRequest = async (request: any): Promise<IResult<any>> => {
    functions.logger.debug(`Handler was called. Request: ${JSON.stringify(request)}`, {structuredData: true});
    return new SuccessResult(request);
}

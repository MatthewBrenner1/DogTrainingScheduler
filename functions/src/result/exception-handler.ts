import {IResult, UnknownErrorResult} from "./result";


export const handleExceptions = <TResult>(fn: () => IResult<TResult>, errorMessage: string = 'Caught while in handle exceptions'): IResult<TResult> => {
    try {
        return fn()
    } catch(error){
        return new UnknownErrorResult<TResult>(errorMessage, error);
    }
}

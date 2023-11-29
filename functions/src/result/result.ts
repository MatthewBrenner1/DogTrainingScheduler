import * as functions from "firebase-functions";


export interface IResult<T>{
    map<TResult>(fn: (arg: T) => Promise<IResult<TResult>>): Promise<IResult<TResult>>;
    tap<TResult>(fn: (arg: T) => Promise<IResult<TResult>>): Promise<IResult<TResult>>;
    unwrap<TResult>(success: (arg: T) => TResult,
                    error: (message: string, exception: any) => TResult
                ): Promise<TResult>;

}

export class ErrorResult<T> implements IResult<T>{
    public message: string;
    public exception: any;
    constructor(message: string, exception: any = new Error()) {
        this.message = message;
        this.exception = exception;
    }
    async tap<TResult>(fn: (arg: T) => Promise<IResult<TResult>>): Promise<IResult<TResult>>{
        return new ErrorResult<TResult>(this.message, this.exception);
    }

    async map<TResult>(fn: (arg: T) => Promise<IResult<TResult>>): Promise<IResult<TResult>>{
        return new ErrorResult<TResult>(this.message, this.exception);
    }

    async unwrap<TResult>
    (success: (arg: T) => TResult,
     error: (message: string, exception: any) => TResult): Promise<TResult> {
        return Promise.resolve(error(this.message, this.exception));
    }
}

export class SuccessResult<T> implements IResult<T>{
    public data: T;
    constructor(val: T) {
        this.data = val;
    }

    async tap<TResult>(fn: (arg: T) => Promise<IResult<TResult>>): Promise<IResult<TResult>>{
        return fn(this.data);
    }

    async map<TResult>(fn: (arg: T) => Promise<IResult<TResult>>): Promise<IResult<TResult>>{
        return fn(this.data);
    }

    async unwrap<TResult>
        (success: (arg: T) => TResult,
         error: (message: string, exception: any) => TResult): Promise<TResult> {
        return Promise.resolve(success(this.data));
    }
}

// This ended up not being worth it. Just log error inline...
export class SuccessWithWarningResult<T> extends SuccessResult<T>{
    public warning: string;
    public exception: any;
    constructor(data: T, warning: string, exception: any = new Error()) {
        const exceptionMessage = exception?.message ? ' ' + exception.message : '';
        functions.logger.error(`SUCCESS WITH WARNING: ${warning}${exceptionMessage}`, {structuredData: true});
        super(data);
        this.warning = warning;
        this.exception = exception;
    }
}

export class ValidationErrorResult<T> extends ErrorResult<T> {
    constructor(message: string) {
        super(`VALIDATION ERROR: ${message}`);
    }
}

export class UnknownErrorResult<T> extends ErrorResult<T> {
    constructor(message: string, exception: any) {
        super(`UNKNOWN ERROR: ${message}`, exception);
    }
}

import {ErrorResult, IResult, SuccessResult, ValidationErrorResult} from "../result/result";
import {handleExceptions} from "../result/exception-handler";
import {ErrorMessages} from "../result/error-messages";
// import {CustomClaimAuthTokens} from "../services/user-auth-service";

// export const validateUser(adminOrTrainer, '')

export const validateEmailIsVerifiedAnd = async (validateFn : (context: any) => any, context: any, request: any) =>
    emailIsVerified(context)
        .map(() => validateFn(context))
        .then(r => r.map(async () => new SuccessResult(request)))


export const userIsAdminOrTrainer = async (context: any): Promise<IResult<any>> =>
    handleExceptions(() =>
            isAdmin(context) || isTrainer(context) ?
                new SuccessResult({})
                : new ValidationErrorResult(ErrorMessages.ValidateAdminOrTrainer),
        ErrorMessages.ValidateAdminOrTrainer);

export const userIsVerifiedUser = async (context: any): Promise<IResult<any>> =>
    handleExceptions(() =>
            isVerifiedUserOrTrainerOrAdmin(context) ?
                new SuccessResult({})
                : new ValidationErrorResult(ErrorMessages.ValidateUser),
        ErrorMessages.ValidateUser);

export const userIsTrainer = async (context: any): Promise<IResult<any>> =>
    handleExceptions(() =>
            isTrainer(context) ?
                new SuccessResult({})
                : new ValidationErrorResult(ErrorMessages.ValidateTrainer),
        ErrorMessages.ValidateTrainer);

export const userIsAdmin = async (context: any): Promise<IResult<any>> =>
    handleExceptions(() =>
            isAdmin(context) ?
                new SuccessResult({})
                : new ValidationErrorResult(ErrorMessages.ValidateAdmin),
        ErrorMessages.ValidateAdmin);

export const validateUserEmail = async (context: any): Promise<IResult<string>> =>
    handleExceptions(() =>
            context.auth?.token.email ?
                new SuccessResult(context.auth?.token.email)
                : new ValidationErrorResult(ErrorMessages.ValidateUserEmail),
        ErrorMessages.ValidateUserEmail);

const emailIsVerified = (context: any): IResult<any> =>
    isVerifiedEmail(context) ? new SuccessResult({}) :
        new ErrorResult(`Email has not been verified`);

const isVerifiedUserOrTrainerOrAdmin = (context: any): boolean =>
    isVerifiedUser(context) || isTrainer(context) || isAdmin(context)

const isVerifiedUser = (context: any): boolean => context.auth?.token?.verifiedUser === true;
const isTrainer = (context: any): boolean => context.auth?.token?.trainer === true;
const isAdmin = (context: any): boolean => context.auth?.token?.admin === true;
const isVerifiedEmail = (context: any): boolean => context.auth?.token?.email_verified === true;


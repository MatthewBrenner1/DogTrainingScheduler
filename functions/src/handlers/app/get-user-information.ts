import {
    userIsVerifiedUser,
    validateEmailIsVerifiedAnd,
    validateUserEmail
} from "../../validators/user-permission-validators";
import {getUserInfoFromEmail} from "../../services/user-service";
import {getDb} from "../../index";
import {getFailureResponse, getSuccessResponse, logRequest} from "../../result/result-extensions";

export const handleGetUserInformation = (request: any, context: any): any =>
    validateEmailIsVerifiedAnd(userIsVerifiedUser, context, request)
        .then(r => r.map(logRequest))
        .then(r => r.map(() => validateUserEmail(context)))
        .then(r => r.map(email => getUserInfoFromEmail(getDb(), email)))
        .then(result => result.unwrap((data: any) => getSuccessResponse(data),
            (message: string, exception: any) => getFailureResponse(message, exception)));

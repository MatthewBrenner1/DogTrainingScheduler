import {
    GiveUserAdminPermissionsRequest,
    GiveUserTrainerPermissionsRequest,
    ManuallyWhiteListUserRequest
} from "../../models";
import {userIsAdmin, userIsAdminOrTrainer, validateEmailIsVerifiedAnd} from "../../validators/user-permission-validators";
import {
    giveUserAdminPermissions,
    giveUserTrainerPermissions,
    giveUserVerifiedUserPermissions
} from "../../services/user-auth-service";
import {getFailureResponse, getSuccessResponse, logRequest} from "../../result/result-extensions";

export const handleGiveUserTrainerPermissions = (request: GiveUserTrainerPermissionsRequest, context: any): any =>
    validateEmailIsVerifiedAnd(userIsAdmin ,context, request)
        .then(r => r.map(logRequest))
        .then(r => r.map(() => giveUserTrainerPermissions(request.email)))
        .then(result => result.unwrap((data: any) => getSuccessResponse(data),
            (message: string, exception: any) => getFailureResponse(message, exception)))

export const handleGiveUserAdminPermissions = (request: GiveUserAdminPermissionsRequest, context: any): any =>
    validateEmailIsVerifiedAnd(userIsAdmin ,context, request)
        .then(r => r.map(logRequest))
        .then(r => r.map(() => giveUserAdminPermissions(request.email)))
        .then(result => result.unwrap((data: any) => getSuccessResponse(data),
            (message: string, exception: any) => getFailureResponse(message, exception)))

export const handleManuallyWhiteUser = (request: ManuallyWhiteListUserRequest, context: any): any =>
    validateEmailIsVerifiedAnd(userIsAdminOrTrainer ,context, request)
        .then(r => r.map(logRequest))
        .then(r => r.map(() => giveUserVerifiedUserPermissions(request.email)))
        .then(result => result.unwrap((data: any) => getSuccessResponse(data),
            (message: string, exception: any) => getFailureResponse(message, exception)))

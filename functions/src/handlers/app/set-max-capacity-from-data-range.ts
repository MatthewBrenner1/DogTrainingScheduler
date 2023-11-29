import {SetMaxCapacityWithDateRangesRequest} from "../../models";
import {userIsAdminOrTrainer, validateEmailIsVerifiedAnd} from "../../validators/user-permission-validators";
import {getFailureResponse, getSuccessResponse, logRequest} from "../../result/result-extensions";
import { IResult, SuccessResult, ValidationErrorResult} from "../../result/result";
import {handleExceptions} from "../../result/exception-handler";
import {ErrorMessages} from "../../result/error-messages";
import {getCapacityBetweenStartAndEndDate, createOrUpdateMaxCapacity} from "../../services/schedule-capacity-service";

export const handleSetMaxCapacityFromDateRange = (request: SetMaxCapacityWithDateRangesRequest, context: any): any =>
    validateEmailIsVerifiedAnd(userIsAdminOrTrainer ,context, request)
        .then(r => r.map(logRequest))
        .then(r => r.map(validateSetMaxCapacityWithDateRangesRequest))
        .then(r => r.map(() => createOrUpdateMaxCapacity(getCapacityBetweenStartAndEndDate, request.newMaxCapacity, {startDateString: request.startDate, endDateString: request.endDate})))
        .then(result => result.unwrap((data: any) => getSuccessResponse(data),
            (message: string, exception: any) => getFailureResponse(message, exception)))

const validateSetMaxCapacityWithDateRangesRequest = async (request: SetMaxCapacityWithDateRangesRequest): Promise<IResult<SetMaxCapacityWithDateRangesRequest>> =>
    handleExceptions(() =>
            !request.startDate ||
            !request.endDate ||
            !request.newMaxCapacity ?
                new ValidationErrorResult(ErrorMessages.ValidateSetMaxCapacityWithDateRangesRequest)
                : new SuccessResult(request),
        ErrorMessages.ValidateSetMaxCapacityWithDateRangesRequest);

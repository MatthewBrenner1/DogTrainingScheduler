import {WhiteListUserFromTrelloRequest} from "../../models";
import { logRequest } from "../../result/result-extensions";
import { IResult, SuccessResult, ValidationErrorResult } from "../../result/result";
import { handleExceptions } from "../../result/exception-handler";
import { ErrorMessages } from "../../result/error-messages";
import { sendEmail } from "../../services/node-mailer-service";
import {whitelistEmail} from "../../services/user-service";

export const handleWhitelistUserFromTrello = (request: WhiteListUserFromTrelloRequest, response: any) =>
  logRequest(request)
    .then(r => r.map(validateRequest))
    .then(r => r.map(whitelistEmail))
    .then(r => r.map(sendWelcomeEmail));

const sendWelcomeEmail = async (request: WhiteListUserFromTrelloRequest) =>
  sendEmail(request.email, 'whitelist', request)

const validateRequest = async (request: WhiteListUserFromTrelloRequest): Promise<IResult<WhiteListUserFromTrelloRequest>> =>
  handleExceptions(() =>
    !request.email || ! request.firstName ?
      new ValidationErrorResult(ErrorMessages.ValidateWhitelistUserFromTrelloRequest)
      : new SuccessResult(request),
    ErrorMessages.ValidateWhitelistUserFromTrelloRequest);


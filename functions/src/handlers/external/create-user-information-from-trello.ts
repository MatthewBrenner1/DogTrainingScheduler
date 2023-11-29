import {CreateUserInformationFromTrelloRequest, UserInformation} from "../../models";
import {logRequest} from "../../result/result-extensions";
import {CollectionPath, commitBatch, setWithBatch} from "../../services/firestore-service";
import {getDb} from "../../index";
import {IResult, SuccessResult, ValidationErrorResult} from "../../result/result";
import {handleExceptions} from "../../result/exception-handler";
import {ErrorMessages} from "../../result/error-messages";
import { firestore } from "firebase-admin";
import Firestore = firestore.Firestore;
import DocumentReference = firestore.DocumentReference;

export const handleCreateUserInformationFromTrello = (request: CreateUserInformationFromTrelloRequest, response: any) =>
    logRequest(request)
        .then(r => r.map(validateRequest))
        .then(r => r.map(updateRequestData))
        .then(r => r.map(setUserInformationDataFromRequest));

const setUserInformationRef = (db: Firestore, item: UserInformation): DocumentReference<any> => db.collection(CollectionPath.UserInformation).doc(item.personalInformation.email.toLowerCase());
const userInformationSetObj = (item: UserInformation): UserInformation => item;

export const setUserInformationDataFromRequest = async (request: UserInformation) => {
        const batch = getDb().batch();
        return await setWithBatch([request], setUserInformationRef, userInformationSetObj, batch)
            .map(async () => commitBatch(batch))
            .then(r => r.map(async () => new SuccessResult(request)));
}

export const setUserInformationDataFromRequestBulk = async (request: UserInformation[]) => {
    const batch = getDb().batch();
    return await setWithBatch(request, setUserInformationRef, userInformationSetObj, batch)
        .map(async () => commitBatch(batch))
        .then(r => r.map(async () => new SuccessResult(request)));
}

const validateRequest = async (request: CreateUserInformationFromTrelloRequest): Promise<IResult<CreateUserInformationFromTrelloRequest>> =>
        handleExceptions(() =>
                !request.email ||
                !request.dogsName ||
                !request.phoneNumber ||
                !request.firstName ||
                !request.lastName ?
                    new ValidationErrorResult(ErrorMessages.ValidateCreateUserInformationFromTrelloRequest)
                    : new SuccessResult(request),
            ErrorMessages.ValidateCreateUserInformationFromTrelloRequest);

const updateRequestData = async (request: CreateUserInformationFromTrelloRequest): Promise<IResult<UserInformation>> =>
    handleExceptions(() =>
     new SuccessResult<UserInformation>(
         {
         personalInformation: {
             email: request.email.toLowerCase(),
             phoneNumber: request.phoneNumber.replace(/[^0-9]/g, ''),
             firstName: request.firstName,
             lastName: request.lastName
         },
         dogInformation: [
             {
                 dogsName: request.dogsName,
                 notes: ''
             }
         ]})
    ,`Failed to updateRequestData`)







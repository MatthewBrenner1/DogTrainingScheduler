import {userIsVerifiedUser, validateEmailIsVerifiedAnd} from "../../validators/user-permission-validators";
import {getDb} from "../../index";
import {getFailureResponse, getSuccessResponse, logRequest} from "../../result/result-extensions";
import {ErrorResult, IResult} from "../../result/result";
import {getDataAndIdFromDoc} from "../../utilities";
import {ErrorMessages} from "../../result/error-messages";
import {firestore} from "firebase-admin";
import Firestore = firestore.Firestore;
import QuerySnapshot = firestore.QuerySnapshot;
import DocumentData = firestore.DocumentData;
import {CollectionPath} from "../../services/firestore-service";

export const handleGetScheduleCapacity = (data: any, context: any): any =>
    validateEmailIsVerifiedAnd(userIsVerifiedUser, context, data)
        .then(r => r.map(logRequest))
        .then(r => r.map(async () => getAllScheduleCapacity(getDb())))
        .then(result => result.unwrap(getSuccessResponse, getFailureResponse))

const getAllScheduleCapacity = (db: Firestore): Promise<IResult<any>> =>
    db.collection(CollectionPath.ScheduleCapacity).get()
        .then((result: QuerySnapshot<DocumentData>) => getDataAndIdFromDoc(result))
        .catch((error: any) => new ErrorResult<any>(ErrorMessages.GetAllScheduleCapacity, error))
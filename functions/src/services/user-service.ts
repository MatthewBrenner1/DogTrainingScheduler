import {ErrorResult, IResult, SuccessResult} from "../result/result";
import {CollectionPath} from "./firestore-service";
import {WhiteListUserFromTrelloRequest} from "../models";
import {getDb} from "../index";

export async function getUserInfoFromEmail(db: any, email: string): Promise<IResult<any>>{
    return await db.collection(CollectionPath.UserInformation).doc(email.toLowerCase()).get()
        .then((result: any) => result.exists ? new SuccessResult(result.data()) : new ErrorResult('User information does not exist for email specified'))
        .catch((error: any) => new ErrorResult(error, 'Failed to get user information from email'));
}

export async function getIsVerifiedFromWhiteListedEmails(db: any, email?: string){
    return await db.collection(CollectionPath.WhitelistedEmails).doc(email?.toLowerCase()).get();
}

export async function whitelistEmail(data: WhiteListUserFromTrelloRequest): Promise<IResult<WhiteListUserFromTrelloRequest>>{
    const whitelistedEmailRef = getDb().collection(CollectionPath.WhitelistedEmails).doc(data.email.toLowerCase());
    return whitelistedEmailRef.set({
        "IsVerified": true
    })
        .then(() => new SuccessResult(data))
        .catch((error: any) => new ErrorResult('Failed to set email is verified to true', error));
}

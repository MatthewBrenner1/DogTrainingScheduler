import {ErrorResult, IResult, SuccessResult} from "../result/result";
import {ErrorMessages} from "../result/error-messages";
import {getAppAuth} from "../index";
import {auth} from "firebase-admin";
import UserRecord = auth.UserRecord;

export enum AuthTokens {
    EmailVerified = 'email_verified',
    Admin = 'admin',
    Trainer = 'trainer',
    VerifiedUser = 'verifiedUser'
}

export const giveUserAdminPermissions = (email: string) =>
    setTokenOnCustomClaimsWithUserEmail(AuthTokens.Admin, email);

export const giveUserTrainerPermissions = (email: string) =>
    setTokenOnCustomClaimsWithUserEmail(AuthTokens.Trainer, email);

export const giveUserVerifiedUserPermissions = (email: string) =>
    setTokenOnCustomClaimsWithUserEmail(AuthTokens.VerifiedUser, email)

const setTokenOnCustomClaimsWithUserEmail = (token: AuthTokens, email: string) =>
    getUserRecordByEmail(email)
        .then(r => r.map((user) => setTokenOnUserRecordsCustomClaims(user, token)))

const setTokenOnUserRecordsCustomClaims = (user: UserRecord, token: string) =>
    getAppAuth()
        .setCustomUserClaims(user.uid, { [token]: true })
        .then(() => new SuccessResult({}))
        .catch(((error: any) => new ErrorResult(ErrorMessages.SetTokenOnUsersCustomClaims, error)))

const getUserRecordByEmail = (email: string): Promise<IResult<UserRecord>> =>
    getAppAuth()
        .getUserByEmail(email.toLowerCase())
        .then((userRecord: UserRecord) => userRecord ?
            new SuccessResult(userRecord) :
            new ErrorResult(ErrorMessages.GetUserByEmail))

import * as functions from "firebase-functions";
const { initializeApp } = require('firebase-admin/app');
import {getIsVerifiedFromWhiteListedEmails} from "./services/user-service";
import {getAuth} from "firebase-admin/auth";
import {
    handleGiveUserAdminPermissions,
    handleGiveUserTrainerPermissions,
    handleManuallyWhiteUser
} from "./handlers/app/user-management-handlers";
import {AuthTokens} from "./services/user-auth-service";
import {handleScheduleDaycare} from "./handlers/app/schedule-daycare";
import {handleScheduleBoarding} from "./handlers/app/schedule-boarding";
import {handleGetUserInformation} from "./handlers/app/get-user-information";
import {handleGetScheduleCapacity} from "./handlers/app/get-schedule-capacity";
import {handleSetMaxCapacityFromDateRange} from "./handlers/app/set-max-capacity-from-data-range";
import {handleRetryGoogleCalendarEvents} from "./handlers/scheduled/retry-google-calendar-events";
const functionsGlobal = require('firebase-functions')
initializeApp();
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const auth = getAuth();
export const getDb = () => db;
export const getAppAuth = (): any => auth;

export const getUserFormData = functions.https.onCall(handleGetUserInformation);
export const getScheduleCapacity = functions.https.onCall(handleGetScheduleCapacity);
export const handleDaycareRequest = functions.https.onCall(handleScheduleDaycare);
export const handleBoardAndTrainRequest = functions.https.onCall(handleScheduleBoarding);
export const setMaxCapacityFromDateRange = functions.https.onCall(handleSetMaxCapacityFromDateRange);
export const manuallyWhiteListUser = functions.https.onCall(handleManuallyWhiteUser);
export const setTrainerPermissions = functions.https.onCall(handleGiveUserTrainerPermissions);
export const setAdminPermissions = functions.https.onCall(handleGiveUserAdminPermissions);

export const retryGoogleCalendarEvents = functions.pubsub.schedule("*/5 * * * *").onRun(async (event: any) => {
    await handleRetryGoogleCalendarEvents();
});

export const setIsVerifiedUser = functions.auth.user().beforeCreate(async (user) => {
    const userEmail = user.email;
    const verifiedUserEmail = await getIsVerifiedFromWhiteListedEmails(db, userEmail);
    const isVerified = verifiedUserEmail.data();
    if (isVerified == null || isVerified['IsVerified'] === false){
        throw new functionsGlobal.https.HttpsError('permission-denied', 'In order to register for ReplacedForPrivacy please schedule a consult at ReplacedForPrivacy.com/consult')
    }

    return  {
        customClaims: { [AuthTokens.VerifiedUser]: true }
    };
});




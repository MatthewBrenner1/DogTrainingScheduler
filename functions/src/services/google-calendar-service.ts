import {
    ErrorResult,
    IResult,
    SuccessResult,
} from "../result/result";

import {
    CreateGoogleCalendarEvent,
    GoogleCalendarFailedEvents, ScheduledData,
} from "../models";
import * as functions from "firebase-functions";
import { GOOGLE_CALENDAR_CONFIG } from "../env";
import {CollectionPath} from "./firestore-service";
import {getDb} from "../index";
import {firestore} from "firebase-admin";
import QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;

const {google} = require('googleapis');
const key = JSON.parse(GOOGLE_CALENDAR_CONFIG ?? "{}");

export async function createEvent(event: any, calendarId: string): Promise<IResult<any>>{
    const jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        [ 'https://www.googleapis.com/auth/calendar' ],
        null
    );

    jwtClient.authorize(function(error: any, tokens: any) {
        if (error) {
            functions.logger.error(`Failed to authorize for google calendar event: ${error}`, {structuredData: true});
            throw new Error(error);
        }
        return;
    });
    const calendar = google.calendar({version: 'v3'});
    return calendar.events.insert({
        auth: jwtClient,
        calendarId: calendarId,
        resource: event,
    }).then(new SuccessResult({}))
        .catch((error: any) => {
            functions.logger.error(`Failed to publish a google calendar event error: ${error}`, {structuredData: true});
            throw new Error(error);
            }
        );
}

const createEvents = async (eventObject: CreateGoogleCalendarEvent, isRetry: boolean = false): Promise<IResult<any>> => {
    const result = await Promise.all(
        eventObject.eventData.map(async (calendarEvent: any) => {
            eventObject.calendarIds.map(async (calendarId: string) => {
                await createEvent(calendarEvent, calendarId)
                    .then(async _ => {
                        if(isRetry){
                            await markEventAsSuccess(calendarEvent.id)
                        }}
                    )
                    .catch(async error => {
                        functions.logger.warn(`Adding event to failed events table: ${JSON.stringify(eventObject.eventData)}`, {structuredData: true});
                        await createFailedEvent({eventData: calendarEvent, calendarId: calendarId}, error.message)
                    });
            })
        return new SuccessResult({});
    }));
    return new SuccessResult(result);
}

export const publishGoogleCalendarEvent = (googleCalendarEvent: CreateGoogleCalendarEvent, data: ScheduledData): Promise<IResult<any>> =>
    createEvents(googleCalendarEvent)
    .then((result) => result.map(async (eventResults: any[]) => new SuccessResult(data)));

export const rePublishGoogleCalendarEvents = async (googleCalendarEvents: CreateGoogleCalendarEvent[]): Promise<IResult<any>> =>
{
    const result = await Promise.all(
        googleCalendarEvents.map(async (googleCalendarEvent: CreateGoogleCalendarEvent) => {
            await createEvents(googleCalendarEvent, true)
                .then((result) => result.map(async (eventResults: any[]) => new SuccessResult({})))
            return new SuccessResult({})
        })
    )
    return new SuccessResult(result);
}

export const getFailedEvents = async (): Promise<IResult<GoogleCalendarFailedEvents[]>> => {
    return await getDb().collection(CollectionPath.FailedGoogleCalendarEvents)
        .where('isSuccess', '==', false )
        .get()
        .then((result: any) => {
            return new SuccessResult<any>(result.docs.map((data: QueryDocumentSnapshot<GoogleCalendarFailedEvents>) => {
                return data.data()
            }));

        })
        .catch((error: any) => new ErrorResult(error, 'Failed to get failed google calendar events'));
}

export const createFailedEvent = async (eventInfo: { eventData: any, calendarId: string}, errorMessage: string): Promise<any> => {
    return await getDb().collection(CollectionPath.FailedGoogleCalendarEvents).doc(eventInfo.eventData.id).set({
        isSuccess: false,
        lastAttempt: new Date(),
        createGoogleCalendarEvent: eventInfo,
        error: errorMessage
    }, {merge: true})
}


export const markEventAsSuccess = async (calendarEventId: string): Promise<any> => {
    return await getDb().collection(CollectionPath.FailedGoogleCalendarEvents).doc(calendarEventId).set({
        isSuccess: true,
        lastAttempt: new Date(),
    }, {merge: true});
}

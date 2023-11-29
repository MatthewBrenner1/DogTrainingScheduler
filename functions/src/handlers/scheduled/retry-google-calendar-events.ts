import {getFailureResponse, getSuccessResponse} from "../../result/result-extensions";
import {getFailedEvents, rePublishGoogleCalendarEvents} from "../../services/google-calendar-service";
import {IResult, SuccessResult} from "../../result/result";
import * as functions from "firebase-functions";
import {CreateGoogleCalendarEvent, GoogleCalendarFailedEvents} from "../../models";

export const handleRetryGoogleCalendarEvents = async () =>
    await getFailedEvents()
        .then(r => r.map(logJobExecution))
        .then(r => r.map(updateEventData))
        .then(r => r.map(republishFailedGoogleCalendarEvents))
        .then(result => result.unwrap(getSuccessResponse, getFailureResponse))

const republishFailedGoogleCalendarEvents = async (createGoogleCalendarEvents: CreateGoogleCalendarEvent[]) =>
 await rePublishGoogleCalendarEvents(createGoogleCalendarEvents);

const logJobExecution = async (failedEvents: GoogleCalendarFailedEvents[]): Promise<IResult<any>> => {
    functions.logger.warn(`Republishing failed google calendar events, Count: ${failedEvents.length}`, {structuredData: true});
    return new SuccessResult(failedEvents);
}

const updateEventData = async (failedEvents: GoogleCalendarFailedEvents[]): Promise<IResult<CreateGoogleCalendarEvent[]>> =>
    new SuccessResult(
        failedEvents.map((failedEvent: GoogleCalendarFailedEvents) => ({
        eventData: [updateEventDataDateTime(failedEvent.createGoogleCalendarEvent.eventData)],
        calendarIds: [failedEvent.createGoogleCalendarEvent.calendarId]
    })));

const updateEventDataDateTime = (eventData: any) => {
    const newEventData = {...eventData};
    newEventData.start.dateTime = newEventData.start.dateTime.toDate();
    newEventData.end.dateTime = newEventData.end.dateTime.toDate();
    return newEventData;
}
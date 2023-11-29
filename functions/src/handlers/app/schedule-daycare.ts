import {
  ScheduleCapacity,
  ScheduleDaycareRequest,
  DaycareAppointmentData,
  CreateGoogleCalendarEvent
} from "../../models";
import { userIsVerifiedUser, validateEmailIsVerifiedAnd } from "../../validators/user-permission-validators";
import { updateOccupancy } from "../../services/schedule-capacity-service";
import { getFailureResponse, getSuccessResponse, logRequest } from "../../result/result-extensions";
import { ErrorResult, IResult, SuccessResult } from "../../result/result";
import { getDb } from "../../index";
import { generateUuid, getDataAndIdFromDoc, getEpochDateTimes } from "../../utilities";
import { ErrorMessages } from "../../result/error-messages";
import { firestore } from "firebase-admin";
import QuerySnapshot = firestore.QuerySnapshot;
import DocumentData = firestore.DocumentData;
import { handleExceptions } from "../../result/exception-handler";
import { updateCapacityAndSetAppointment } from "../../services/scheduler-service";
import { publishGoogleCalendarEvent } from "../../services/google-calendar-service";
import { sendEmail } from "../../services/node-mailer-service";
import { setDaycareAppointment } from "../../services/appointment-service";
import {
  DAYCARE_AND_TRAINING_CALENDAR_ID,
  DAYCARE_CALENDAR_ID
} from "../../env";


export const handleScheduleDaycare = (request: ScheduleDaycareRequest, context: any): any =>
  validateEmailIsVerifiedAnd(userIsVerifiedUser, context, request)
    .then(r => r.map(logRequest))
    .then(r => r.map(validateScheduleDaycareRequest))
    .then(r => r.map(createAppointmentDataFromRequest))
    .then(r => r.map(updateOccupancyAndSetAppointment))
    .then(r => r.map(publishCalendarEvent))
    .then(r => r.map(sendConfirmationEmail))
    .then(r => r.unwrap(getSuccessResponse, getFailureResponse))


const sendConfirmationEmail = (data: DaycareAppointmentData) => sendEmail(data.email, 'daycare', data);
const publishCalendarEvent = (data: DaycareAppointmentData) => publishGoogleCalendarEvent(getDaycareCalendarEvent(data), data)

const updateOccupancyAndSetAppointment = (data: DaycareAppointmentData): Promise<IResult<DaycareAppointmentData>> =>
  getCapacityFromDates(data.daycareDates)
    .then(r => r.map(scheduleCapacities => updateCapacityAndSetAppointment(updateOccupancy(scheduleCapacities, data), setDaycareAppointment(data))))
    .then(r => r.map(async () => new SuccessResult(data)));

const getCapacityFromDates = (dates: string[]): Promise<IResult<ScheduleCapacity[]>> =>
  getEpochDateTimes(dates)
    .map(dates =>
      getDb()
        .collection('ScheduleCapacity')
        .where('scheduleDateEpochTime', 'in', dates)
        .get()
        .then((result: QuerySnapshot<DocumentData>) => getDataAndIdFromDoc(result))
        .catch((error: any) => new ErrorResult<any>(ErrorMessages.ExecuteGetForDaycare, error)));

const createAppointmentDataFromRequest = async (request: ScheduleDaycareRequest): Promise<IResult<DaycareAppointmentData>> => {
  return new SuccessResult({
    ...request,
    id: generateUuid(),
    eventIds: request.daycareDates.map(date => {
      return {
        eventId: generateUuid(),
        date: date
      }
    })
  });
}

const validateScheduleDaycareRequest = async (request: ScheduleDaycareRequest): Promise<IResult<ScheduleDaycareRequest>> =>
  handleExceptions(() =>
    request.daycareDates.length < 1 ||
      request.dogData.length < 1 ||
      !request.email ||
      !request.phoneNumber ||
      !request.firstName ||
      !request.lastName ?
      new ErrorResult(ErrorMessages.ValidateScheduleDaycareRequest)
      : new SuccessResult(request),
    ErrorMessages.ValidateScheduleDaycareRequest);

const getDaycareCalendarEvent = (info: DaycareAppointmentData): CreateGoogleCalendarEvent => {
  const events = [];
  for (const event of info.eventIds) {
    const summary = `${info.dogData[0].dogsName} - ${info.firstName} ${info.lastName}`;
    const startDate = new Date(event.date);
    startDate.setHours(12, 0, 0);
    const endDate = new Date(event.date);
    endDate.setHours(12, 0, 0);

    const dogsName = info.dogData
        .map(dog => {
          const includeTraining = dog.includeTraining ? ' (Includes Training)' : '';
          return `${dog.dogsName}${includeTraining}`
        });

    const notes = info.dogData.some(dog => dog.notes)
        ? info.dogData.filter(dog => dog.notes)
            .map(dog => `Notes for ${dog.dogsName}: ${dog.notes}`).join(', ')
        : 'No Notes';

    events.push({
      'id': event.eventId,
      'summary': summary,
      'description': `
        First Name: ${info.firstName}
        Last Name: ${info.lastName}
        Dogs: ${dogsName.join(', ')}
        Email: ${info.email}
        Phone: ${info.phoneNumber}
        Dates: ${info.daycareDates.join(', ')}
        ${notes}
    `,
      'start': {
        'dateTime': startDate,
        'timeZone': 'America/Boise'
      },
      'end': {
        'dateTime': endDate,
        'timeZone': 'America/Boise'
      },
      'transparency': 'transparent'
    });
  }

  const calendarIds = [];
  const anyDogIncludesTraining = info.dogData.some(dog => dog.includeTraining);
  const anyDogDoesNotIncludesTraining = info.dogData.some(dog => !dog.includeTraining);

  if (anyDogIncludesTraining) calendarIds.push(DAYCARE_AND_TRAINING_CALENDAR_ID);
  if (anyDogDoesNotIncludesTraining) calendarIds.push(DAYCARE_CALENDAR_ID);

  return {eventData: events, calendarIds: calendarIds};
}

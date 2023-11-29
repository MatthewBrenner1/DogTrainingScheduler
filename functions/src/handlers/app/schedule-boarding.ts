import {
    BoardingAppointmentData, CreateGoogleCalendarEvent, DropOffPickUp,
    ScheduleBoardAndTrainRequest,
    ScheduleCapacity
} from "../../models";
import { userIsVerifiedUser, validateEmailIsVerifiedAnd } from "../../validators/user-permission-validators";
import { publishGoogleCalendarEvent } from "../../services/google-calendar-service";
import { getFailureResponse, getSuccessResponse, logRequest } from "../../result/result-extensions";
import { ErrorResult, IResult, SuccessResult, ValidationErrorResult } from "../../result/result";
import { getDb } from "../../index";
import { ErrorMessages } from "../../result/error-messages";
import { firestore } from "firebase-admin";
import QuerySnapshot = firestore.QuerySnapshot;
import DocumentData = firestore.DocumentData;
import {generateUuid, getDataAndIdFromDoc, getDaysArray, setDateToCorrectTimeFromString} from "../../utilities";
import { handleExceptions } from "../../result/exception-handler";
import { updateCapacityAndSetAppointment } from "../../services/scheduler-service";
import { updateOccupancy } from "../../services/schedule-capacity-service";
import { sendEmail } from "../../services/node-mailer-service";
import { setBoardingAppointment } from "../../services/appointment-service";
import {BOARDING_AND_TRAINING_CALENDAR_ID, BOARDING_CALENDAR_ID} from "../../env";

export const handleScheduleBoarding = (request: ScheduleBoardAndTrainRequest, context: any): any =>
  validateEmailIsVerifiedAnd(userIsVerifiedUser, context, request)
    .then(r => r.map(logRequest))
    .then(r => r.map(validateRequest))
    .then(r => r.map(createAppointmentDataFromRequest))
    .then(r => r.map(updateOccupancyAndSetAppointment))
    .then(r => r.map(publishCalendarEvent))
    .then(r => r.map(sendConfirmationEmail))
    .then(r => r.unwrap(getSuccessResponse, getFailureResponse));

const updateOccupancyAndSetAppointment = async (data: BoardingAppointmentData): Promise<IResult<BoardingAppointmentData>> =>
  getCapacityBetweenStartAndEndDate(data)
    .then(r => r.map(scheduleCapacities => updateCapacityAndSetAppointment(updateOccupancy(scheduleCapacities, data), setBoardingAppointment(data))))
    .then(r => r.map(async () => new SuccessResult(data)));

const sendConfirmationEmail = (data: BoardingAppointmentData) => sendEmail(data.email, 'boarding', data);
const publishCalendarEvent = (data: BoardingAppointmentData) => publishGoogleCalendarEvent(getBoardingCalendarEvent(data), data);

const getCapacityBetweenStartAndEndDate = (data: BoardingAppointmentData): Promise<IResult<ScheduleCapacity[]>> =>
  getDb().collection('ScheduleCapacity')
    .where('scheduleDateEpochTime', '>=', setDateToCorrectTimeFromString(data.startDate).getTime())
    .where('scheduleDateEpochTime', '<=', setDateToCorrectTimeFromString(data.endDate).getTime())
    .get()
    .then((result: QuerySnapshot<DocumentData>) => getDataAndIdFromDoc(result))
    .catch((error: any) => new ErrorResult<any>(ErrorMessages.ExecuteGetForBoarding, error))

const createAppointmentDataFromRequest = async (request: ScheduleBoardAndTrainRequest): Promise<IResult<BoardingAppointmentData>> => {
    const [days, nights] = getDaysAndNightsCount(request.startDate, request.endDate, request.dropOff, request.pickUp);
    return new SuccessResult({
        ...request,
        id: generateUuid(),
        eventId: generateUuid(),
        days,
        nights
    });
}

const validateRequest = async (request: ScheduleBoardAndTrainRequest): Promise<IResult<ScheduleBoardAndTrainRequest>> =>
  handleExceptions(() =>
    !request.startDate ||
      !request.endDate ||
      request.dogData.length < 1 ||
      !request.email ||
      !request.phoneNumber ||
      !request.firstName ||
      !request.lastName ||
      !request.dropOff ||
      !request.pickUp ?
      new ValidationErrorResult(ErrorMessages.ValidateScheduleBoardingRequest)
      : new SuccessResult(request),
    ErrorMessages.ValidateScheduleBoardingRequest);

const getBoardingCalendarEvent = (info: BoardingAppointmentData): CreateGoogleCalendarEvent => {
    const summary = `${info.dogData[0].dogsName} - ${info.firstName} ${info.lastName}`;
    const startDate = new Date(info.startDate);
    startDate.setHours(12, 0, 0);
    const endDate = new Date(info.endDate);
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

    const event = {
        'id': info.eventId,
        'summary': summary,
        'description': `
          First Name: ${info.firstName}
          Last Name: ${info.lastName}
          Dogs: ${dogsName.join(', ')}
          Email: ${info.email}
          Phone: ${info.phoneNumber}
          Dates: ${info.startDate} - ${info.endDate}
          Drop-off: ${info.dropOff}
          Pickup: ${info.pickUp}
          Days: ${info.days}
          Nights: ${info.nights}
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
  };

  const calendarIds = [];
  const anyDogIncludesTraining = info.dogData.some(dog => dog.includeTraining);
  const anyDogDoesNotIncludesTraining = info.dogData.some(dog => !dog.includeTraining);

  if (anyDogIncludesTraining) calendarIds.push(BOARDING_AND_TRAINING_CALENDAR_ID);
  if (anyDogDoesNotIncludesTraining) calendarIds.push(BOARDING_CALENDAR_ID);

  return {eventData: [event], calendarIds: calendarIds};
}

const getDaysAndNightsCount = (startDate: string, endDate: string, dropOff: DropOffPickUp, pickUp: DropOffPickUp) => {
    const dateRangeLength = getDaysArray(startDate, endDate).length;
    var days = dateRangeLength;
    const nights = dateRangeLength - 1;

    if (dropOff === 'PM' ){
        days -= 1;
    }
    if (pickUp === 'AM'){
        days -= 1;
    }
    return [days, nights];
}

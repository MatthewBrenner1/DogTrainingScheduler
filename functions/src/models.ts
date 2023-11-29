export interface GiveUserAdminPermissionsRequest extends GiveUserPermissionRequest {}
export interface GiveUserTrainerPermissionsRequest  extends GiveUserPermissionRequest {}
export interface ManuallyWhiteListUserRequest extends GiveUserPermissionRequest {}
export interface GiveUserPermissionRequest {
    email: string
}

export type ScheduledData = DaycareAppointmentData | BoardingAppointmentData;
export type DropOffPickUp = 'AM' | 'PM';

interface DaycareEvent {
    date: string,
    eventId: string

}
export interface DaycareAppointmentData extends ScheduleDaycareRequest{
    id: string,
    eventIds: DaycareEvent[]
}

export interface BoardingAppointmentData extends ScheduleBoardAndTrainRequest{
    id: string,
    eventId: string,
    days: number,
    nights: number
}

export interface SetMaxCapacityWithDateRangesRequest {
    startDate: string,
    endDate: string,
    newMaxCapacity: number
}

export interface SaveScheduleCapacityResponse {
    isSuccess: boolean,
    errors?: { message: string },
    data?: ScheduleBoardAndTrainRequest | ScheduleDaycareRequest
}

export interface GetCapacityResponse {
    isSuccess: boolean,
    errors?: { message: string },
    data?: any
}

export interface ScheduleRequest {
    firstName: string,
    lastName: string,
    dogData: DogData[],
    phoneNumber: string,
    email: string
}

export interface ScheduleBoardAndTrainRequest extends ScheduleRequest{
    startDate: string,
    endDate: string,
    dropOff: DropOffPickUp,
    pickUp: DropOffPickUp
}

export interface CreateUserInformationFromTrelloRequest {
    firstName: string,
    lastName: string,
    dogsName: string,
    phoneNumber: string,
    email: string
}

export interface WhiteListUserFromTrelloRequest {
    firstName: string,
    email: string
}

export interface ScheduleDaycareRequest extends ScheduleRequest {
    daycareDates: string[]
}

export interface UpdateScheduleCapacity extends ScheduleCapacity{
    numberOfDogs: number
}

interface DogData {
    dogsName: string,
    notes: string,
    includeTraining: boolean
}

export interface CreateGoogleCalendarEvent {
    eventData: any[],
    calendarIds: string[]
}

export interface DaycareGoogleCalendarEvent {}

export interface BoardingGoogleCalendarEvent {}
// type CreateGoogleCalendarEventData = DaycareGoogleCalendarEvent | BoardingGoogleCalendarEvent;

// Firestore database table types
export interface ScheduleCapacity {
    id: string,
    maxCapacity: number,
    currentOccupancy: number
    scheduleDateEpochTime: number
}

export interface UserInformation {
    dogInformation: DogInformation[],
    personalInformation: PersonalInformation,
}

interface DogInformation{
    dogsName: string,
    notes: string
}

interface PersonalInformation {
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber: string
}

export interface GoogleCalendarFailedEvents {
    lastAttempt: string,
    isSuccess: boolean,
    createGoogleCalendarEvent: any,
    error: string
}


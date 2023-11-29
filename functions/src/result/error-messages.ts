
// This was not worth it. I rather just see the error messages in the code

export enum ErrorMessages {
    // schedule-capacity-service error messages
    ExecuteGetForBoarding = 'Failed to get schedule capacity for boarding',
    ExecuteGetForDaycare = 'Failed to get schedule capacity for daycare',
    GetEpochDateTimes = 'Failed to convert date strings into epoch time',
    GetDataAndIdFromDoc = 'Failed to convert document data to object',
    GetAllScheduleCapacity = 'Failed to get all schedule capacity',
    ValidateOccupancyLevels = 'Some dates are no longer available, please try again with new dates selected',


    SetNewMaxCapacityOnScheduleCapacities = 'Failed to set the new capacity on the object',

    // db-service error messages

    CommitBatch = 'Failed to commit batch',
    UpdateBatch = 'Failed to update in batch',
    SetBatch = 'Failed to set in batch',
    StartBatch= 'Failed to start batch',

    // validators error messages
    ValidateScheduleDaycareRequest = 'Failed to schedule daycare, missing request data',
    ValidateCreateUserInformationFromTrelloRequest = 'Failed to validate CreateUserInformationFromTrelloRequest, missing data',
    ValidateWhitelistUserFromTrelloRequest = 'Failed to validate WhitelistUserFromTrelloRequest, missing email',
    ValidateScheduleBoardingRequest = 'Failed to schedule boarding, missing request data',
    ValidateSetMaxCapacityWithDateRangesRequest = 'Failed to update max capacity, missing or incorrect request data',
    ValidateUser = 'User is not authorized to access this page',
    ValidateAdmin = 'User is not authorized to access this page',
    ValidateTrainer = 'User is not authorized to access this page',
    ValidateAdminOrTrainer = 'User is not authorized to access this page',
    ValidateUserEmail = 'Could not find user email',

    // google calendar service error messages
    PublishGoogleCalendarEvent = 'Failed to publish google calendar event',

    // user auth service
    SetTokenOnCustomClaimsNoUser = 'Failed to give user updated permissions, email provided does not correspond with an account',
    SetTokenOnUsersCustomClaims = 'Failed to give user updated permissions, reach out to a developer to review logs',

    GetUserByEmail = 'Failed to get user by email address provided'
}

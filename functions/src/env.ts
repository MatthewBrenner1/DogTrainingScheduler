const gProcess = require('process');

const getEnvVariableOrEmpty = (envVariable: any) =>
    envVariable ?? '';

export const BOARDING_CALENDAR_ID = getEnvVariableOrEmpty(gProcess.env.BOARDING_CALENDAR_ID);
export const BOARDING_AND_TRAINING_CALENDAR_ID = getEnvVariableOrEmpty(gProcess.env.BOARDING_AND_TRAINING_CALENDAR_ID);
export const DAYCARE_CALENDAR_ID = getEnvVariableOrEmpty(gProcess.env.DAYCARE_CALENDAR_ID);
export const DAYCARE_AND_TRAINING_CALENDAR_ID = getEnvVariableOrEmpty(gProcess.env.DAYCARE_AND_TRAINING_CALENDAR_ID);
export const EXTERNAL_API_KEY = getEnvVariableOrEmpty(gProcess.env.EXTERNAL_API_KEY);
export const NODE_MAILER_TRANSPORT_CONFIG = getEnvVariableOrEmpty(gProcess.env.NODE_MAILER_TRANSPORT_CONFIG);
export const GOOGLE_CALENDAR_CONFIG = gProcess.env.GOOGLE_CALENDAR_CONFIG ?? "{ }";
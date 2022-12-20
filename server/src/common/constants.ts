import dotenv from 'dotenv';

dotenv.config();

export const APP_URL = process.env.APP_URL;

export const TIMECAMP_HOST_URL = process.env.TIMECAMP_HOST_URL;

export const jwtConstants = {
  secret: process.env.JWT_SECRET,
  expires: process.env.JWT_ACCESS_TOKEN_EXPIRED,
};

export const DATA_SOURCE = 'DATA_SOURCE';

// Repository
export enum GEOFENCE_REPOSITORIES {
  JOBSITE_REPOSITORY = 'JOBSITE_REPOSITORY',
  JOBSITE_USER_REPOSITORY = 'JOBSITE_USER_REPOSITORY',
}

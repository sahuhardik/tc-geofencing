import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import axios, { AxiosError, AxiosInstance } from 'axios';
import chalk from 'chalk';
import _ from 'lodash';

function logErrServer(type: string, message: string): string {
  const logErr = `${chalk.green('[server]')}: ${chalk.red(type)} ${chalk.green(
    message,
  )}`;
  return logErr;
}

function createAxios(baseUri: string): AxiosInstance {
  const instanceAxios = axios.create({
    baseURL: baseUri,
    timeout: 5000,
  });

  // interceptor request
  instanceAxios.interceptors.request.use((config) => {
    return config;
  });

  // interceptor response
  instanceAxios.interceptors.response.use(
    function onSuccess(response) {
      return response;
    },

    async function onError(error: AxiosError): Promise<never> {
      const statusCode = _.get(error, 'response.status', null);
      const message = _.get(error, 'response.data.error_code', null);

      const errAxios = (type: string): string =>
        chalk.red(`Axios Err: ${type}`);

      if (statusCode === 401) {
        console.log(logErrServer(errAxios('Unauthorized'), message));
        throw new UnauthorizedException(message);
      }

      if (statusCode === 400) {
        console.log(logErrServer(errAxios('Bad Request'), message));
        throw new BadRequestException(message);
      }

      if (statusCode === 404) {
        console.log(logErrServer(errAxios('Not Found'), message));
        throw new NotFoundException(message);
      }

      const handleError = error?.response?.headers?.handleError as any;

      if (!handleError || !handleError(error)) {
        if (error.code === 'ECONNREFUSED') {
          console.log(logErrServer(errAxios('Service Unavailable'), message));
          throw new InternalServerErrorException('Service Unavailable');
        }

        const errMessage = error.response?.data ?? error.message;

        console.log(`Fetcher: ${errAxios(errMessage as string)}`);
        throw new BadRequestException(errMessage);
      }
      return await Promise.reject(error);
    },
  );

  return instanceAxios;
}

class FetchApi {
  private axiosInstance: AxiosInstance | null;
  private readonly baseUri: string;

  constructor(baseUri: string) {
    this.axiosInstance = null;
    this.baseUri = baseUri;
  }

  public get default(): AxiosInstance {
    if (!this.axiosInstance) {
      this.axiosInstance = createAxios(this.baseUri);

      return this.axiosInstance;
    }

    return this.axiosInstance;
  }
}

export default FetchApi;

import { XMLHttpRequest } from '@ephox/dom-globals';
import { FutureResult } from '@ephox/katamari';
import * as JsonResponse from './JsonResponse';
import { ResponseTypeMap, ResponseBodyDataTypes } from './HttpData';
import { HttpError } from './HttpError';
import { DataType } from './DataType';

export const validate = <T extends keyof ResponseTypeMap>(responseType: ResponseBodyDataTypes, request: XMLHttpRequest): FutureResult<ResponseTypeMap[T], HttpError> => {
  const normal = () => FutureResult.pure(request.response);

  const error = (message: string) => FutureResult.error({
    message,
    status: request.status,
    responseText: request.responseText
  });

  switch (responseType) {
    case DataType.JSON: return JsonResponse.create(request.response).fold(error, FutureResult.pure);
    case DataType.Blob: return normal();
    case DataType.Text: return normal();
    default: return error('unknown data type');
  }
};
import { DataType } from './DataType';

export interface ResponseTypeMap {
  [DataType.JSON]: any;
  [DataType.Blob]: Blob;
  [DataType.Text]: string;
}

export type ResponseType = keyof ResponseTypeMap;
export type RequestBody = JsonData | BlobData | TextData | FormData | MultipartFormData;
export type ResponseBody = Exclude<RequestBody, FormData>;
export type ResponseBodyDataTypes = Exclude<DataType, DataType.FormData>;

export interface JsonData {
  type: DataType.JSON;
  data: unknown;
}

export interface BlobData {
  type: DataType.Blob;
  data: Blob;
}

export interface TextData {
  type: DataType.Text;
  data: string;
}

export interface FormData {
  type: DataType.FormData;
  data: Record<string, string>;
}

export interface MultipartFormData {
  type: DataType.MultipartFormData;
  data: Record<string, string | Blob | File>;
}

export const jsonData = (data: any): JsonData => ({ type: DataType.JSON, data });
export const blobData = (data: Blob): BlobData => ({ type: DataType.Blob, data });
export const textData = (data: string): TextData => ({ type: DataType.Text, data });
export const formData = (data: Record<string, string>): FormData => ({ type: DataType.FormData, data });
export const multipartFormData = (data: Record<string, string | Blob | File>): MultipartFormData => ({ type: DataType.MultipartFormData, data });

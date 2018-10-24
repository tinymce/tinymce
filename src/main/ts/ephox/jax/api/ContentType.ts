import { Adt } from '@ephox/katamari';
import { USVString, FormData, Document, Blob, BufferSource, ReadableStream } from '@ephox/dom-globals';

type FileData = Blob | BufferSource | ReadableStream;
type FormData_ = FormData;
type JsonData = any;
type PlainData = USVString;
type HtmlData = USVString | Document;

export interface ContentType {
  fold: <T>(
    fileHandler: (data: FileData) => T,
    formHandler: (data: FormData_) => T,
    jsonHandler: (data: JsonData) => T,
    plainHandler: (data: PlainData) => T,
    htmlHandler: (data: HtmlData) => T
  ) => T;
  match: <T>(branches: {
    file: (data: FileData) => T,
    form: (data: FormData_) => T,
    json: (data: JsonData) => T,
    plain: (data: PlainData) => T,
    html: (data: HtmlData) => T
  }) => T;
  log: (label: string) => void;
};

const adt: {
  file: (d: FileData) => ContentType,
  form: (d: FormData_) => ContentType,
  json: (d: JsonData) => ContentType,
  plain: (d: PlainData) => ContentType,
  html: (d: HtmlData) => ContentType
} = Adt.generate([
  { file: ['data'] },
  { form: ['data'] },
  { json: ['data'] },
  { plain: ['data'] },
  { html: ['data'] }
]);

export const ContentType = {
  file: adt.file,
  form: adt.form,
  json: adt.json,
  plain: adt.plain,
  html: adt.html
};
import { Adt } from '@ephox/katamari';

export interface ResponseType {
  fold: <T>(
    jsonHandler: () => T,
    blobHandler: () => T,
    textHandler: () => T,
    htmlHandler: () => T,
    xmlHandler: () => T
  ) => T;
  match: <T>(branches: {
    json: () => T,
    blob: () => T,
    text: () => T,
    html: () => T,
    xml: () => T
  }) => T;
  log: (label: string) => void;
};

const adt: {
  json: () => ResponseType;
  blob: () => ResponseType;
  text: () => ResponseType;
  html: () => ResponseType;
  xml: () => ResponseType;
} = Adt.generate([
  // NOTE: "json" does not have 100% browser support
  { json: [ ] },
  { blob: [ ] },
  { text: [ ] },
  { html: [ ] },
  { xml: [ ] }
]);

const cata = function <T> (subject: ResponseType, onJson: () => T, onBlob: () => T, onText: () => T, onHtml: () => T, onXml: () => T) {
  return subject.match({
    json: onJson,
    blob: onBlob,
    text: onText,
    html: onHtml,
    xml: onXml
  });
};

export const ResponseType = {
  json: adt.json,
  blob: adt.blob,
  text: adt.text,
  html: adt.html,
  xml: adt.xml,

  // Not sure about this format
  cata: cata
};
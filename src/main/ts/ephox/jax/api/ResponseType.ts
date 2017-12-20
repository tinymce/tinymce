import { Adt } from '@ephox/katamari';

var adt = Adt.generate([
  // NOTE: "json" does not have 100% browser support
  { json: [ ] },
  { blob: [ ] },
  { text: [ ] },
  { html: [ ] },
  { xml: [ ] }
]);

var cata = function (subject, onJson, onBlob, onText, onHtml, onXml) {
  return subject.match({
    json: onJson,
    blob: onBlob,
    text: onText,
    html: onHtml,
    xml: onXml
  });
};

export default <any> {
  json: adt.json,
  blob: adt.blob,
  text: adt.text,
  html: adt.html,
  xml: adt.xml,

  // Not sure about this format
  cata: cata
};
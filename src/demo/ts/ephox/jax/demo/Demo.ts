import * as Ajax from 'ephox/jax/api/Ajax';
import { ContentType } from 'ephox/jax/api/ContentType';
import { Credentials } from 'ephox/jax/api/Credentials';
import { ResponseType } from 'ephox/jax/api/ResponseType';
import { FormData } from '@ephox/sand';
import { console } from '@ephox/dom-globals';
import { ResponseError } from 'ephox/jax/response/ResponseError';
import { Result } from '@ephox/katamari';

const handler = function (label: string) {
  return function (result: Result<any, ResponseError>) {
    result.fold(
      function (err) {
        console.error(label + ': ' + err);
      },
      function (val) {
        console.log(label, val);
      }
    );
  };
};


Ajax.get(
  '../../../package.json',
  ResponseType.json(),
  Credentials.none(),
  { }
).get(handler('valid json file'));

Ajax.get(
  '../../../src/demo/xml/data.xml',
  ResponseType.xml(),
  Credentials.none(),
  { }
).get(handler('valid xml file'));

Ajax.get(
  '../../../package.json',
  ResponseType.text(),
  Credentials.none(),
  { }
).get(handler('valid text file'));

const formdata = FormData();
formdata.append('alpha', 'Alpha');
formdata.append('beta', 'Beta');
Ajax.post(
  'http://fake-url/fake-url',
  ContentType.form(formdata),
  ResponseType.json(),
  Credentials.none(),
  { }
).get(handler('form encoded attempt without a real server'));

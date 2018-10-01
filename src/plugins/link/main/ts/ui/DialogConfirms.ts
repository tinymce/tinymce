import { Future, Option, Options } from '@ephox/katamari';
import Delay from 'tinymce/core/api/util/Delay';

import { LinkDialogOutput } from './DialogTypes';

// Delay confirm since onSubmit will move focus
const delayedConfirm = function (editor, message, callback) {
  const rng = editor.selection.getRng();

  Delay.setEditorTimeout(editor, function () {
    editor.windowManager.confirm(message, function (state) {
      editor.selection.setRng(rng);
      callback(state);
    });
  });
};

interface Transformer {
  message: string;
  preprocess: (d: LinkDialogOutput) => LinkDialogOutput;
}

const tryEmailTransform = (data: LinkDialogOutput): Option<Transformer> => {
  const url = data.href;
  const suggestMailTo = url.indexOf('@') > 0 && url.indexOf('//') === -1 && url.indexOf('mailto:') === -1;
  return suggestMailTo ? Option.some({
    message: 'The URL you entered seems to be an email address. Do you want to add the required mailto: prefix?',
    preprocess: (oldData) => ({ ...oldData, href: 'mailto:' + url })
  }) : Option.none();
};

const tryProtocolTransform = (assumeExternalTargets: boolean) => (data: LinkDialogOutput): Option<Transformer> => {
  const url = data.href;
  const suggestProtocol = (
    assumeExternalTargets === true && !/^\w+:/i.test(url) ||
    assumeExternalTargets === false && /^\s*www[\.|\d\.]/i.test(url)
  );

  return suggestProtocol ? Option.some({
    message: 'The URL you entered seems to be an external link. Do you want to add the required http:// prefix?',
    preprocess: (oldData) => ({ ...oldData, href: 'http://' + url })
  }) : Option.none();
};

const preprocess = (editor, assumeExternalTargets: boolean, data: LinkDialogOutput): Future<LinkDialogOutput> => {
  console.log('preprocessing');
  return Options.findMap(
    [ tryEmailTransform, tryProtocolTransform(assumeExternalTargets) ],
    (f) => f(data)
  ).fold(
    () => Future.pure(data),
    (transform) => Future.nu((callback) => {
      delayedConfirm(editor, transform.message, (state) => {
        console.log('state', state);
        callback(state ? transform.preprocess(data) : data);
      });
    })
  );
};

export const DialogConfirms = {
  preprocess
};
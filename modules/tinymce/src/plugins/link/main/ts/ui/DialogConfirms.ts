/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Future, Option, Options } from '@ephox/katamari';
import Delay from 'tinymce/core/api/util/Delay';
import Editor from 'tinymce/core/api/Editor';

import { AssumeExternalTargets } from '../api/Types';
import Utils from '../core/Utils';
import { LinkDialogOutput } from './DialogTypes';

// Delay confirm since onSubmit will move focus
const delayedConfirm = function (editor: Editor, message: string, callback: (state: boolean) => void) {
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

const tryProtocolTransform = (assumeExternalTargets: AssumeExternalTargets) => (data: LinkDialogOutput): Option<Transformer> => {
  const url = data.href;
  const suggestProtocol = (
    assumeExternalTargets === AssumeExternalTargets.WARN && !Utils.hasProtocol(url) ||
    assumeExternalTargets === AssumeExternalTargets.OFF && /^\s*www[\.|\d\.]/i.test(url)
  );

  return suggestProtocol ? Option.some({
    message: 'The URL you entered seems to be an external link. Do you want to add the required http:// prefix?',
    preprocess: (oldData) => ({ ...oldData, href: 'http://' + url })
  }) : Option.none();
};

const preprocess = (editor: Editor, assumeExternalTargets: AssumeExternalTargets, data: LinkDialogOutput): Future<LinkDialogOutput> => {
  return Options.findMap(
    [ tryEmailTransform, tryProtocolTransform(assumeExternalTargets) ],
    (f) => f(data)
  ).fold(
    () => Future.pure(data),
    (transform) => Future.nu((callback) => {
      delayedConfirm(editor, transform.message, (state) => {
        callback(state ? transform.preprocess(data) : data);
      });
    })
  );
};

export const DialogConfirms = {
  preprocess
};

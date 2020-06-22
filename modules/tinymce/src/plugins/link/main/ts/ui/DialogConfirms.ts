/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import Promise from 'tinymce/core/api/util/Promise';

import * as Settings from '../api/Settings';
import { AssumeExternalTargets } from '../api/Types';
import * as Utils from '../core/Utils';
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
  const suggestMailTo = url.indexOf('@') > 0 && url.indexOf('/') === -1 && url.indexOf('mailto:') === -1;
  return suggestMailTo ? Option.some({
    message: 'The URL you entered seems to be an email address. Do you want to add the required mailto: prefix?',
    preprocess: (oldData) => ({ ...oldData, href: 'mailto:' + url })
  }) : Option.none();
};

const tryProtocolTransform = (assumeExternalTargets: AssumeExternalTargets, defaultLinkProtocol: string) => (data: LinkDialogOutput): Option<Transformer> => {
  const url = data.href;
  const suggestProtocol = (
    assumeExternalTargets === AssumeExternalTargets.WARN && !Utils.hasProtocol(url) ||
    assumeExternalTargets === AssumeExternalTargets.OFF && /^\s*www[\.|\d\.]/i.test(url)
  );

  return suggestProtocol ? Option.some({
    message: `The URL you entered seems to be an external link. Do you want to add the required ${defaultLinkProtocol}:// prefix?`,
    preprocess: (oldData) => ({ ...oldData, href: defaultLinkProtocol + '://' + url })
  }) : Option.none();
};

const preprocess = (editor: Editor, data: LinkDialogOutput): Promise<LinkDialogOutput> => Arr.findMap(
  [ tryEmailTransform, tryProtocolTransform(Settings.assumeExternalTargets(editor), Settings.getDefaultLinkProtocol(editor)) ],
  (f) => f(data)
).fold(
  () => Promise.resolve(data),
  (transform) => new Promise((callback) => {
    delayedConfirm(editor, transform.message, (state) => {
      callback(state ? transform.preprocess(data) : data);
    });
  })
);

export const DialogConfirms = {
  preprocess
};

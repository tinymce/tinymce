/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import Promise from 'tinymce/core/api/util/Promise';

import * as Settings from '../api/Settings';
import { AssumeExternalTargets } from '../api/Types';
import * as Utils from '../core/Utils';
import { LinkDialogOutput } from './DialogTypes';

interface Transformer {
  readonly message: string;
  readonly preprocess: (d: LinkDialogOutput) => LinkDialogOutput;
}

// Delay confirm since onSubmit will move focus
const delayedConfirm = (editor: Editor, message: string, callback: (state: boolean) => void): void => {
  const rng = editor.selection.getRng();

  Delay.setEditorTimeout(editor, () => {
    editor.windowManager.confirm(message, (state) => {
      editor.selection.setRng(rng);
      callback(state);
    });
  });
};

const tryEmailTransform = (data: LinkDialogOutput): Optional<Transformer> => {
  const url = data.href;
  const suggestMailTo = url.indexOf('@') > 0 && url.indexOf('/') === -1 && url.indexOf('mailto:') === -1;
  return suggestMailTo ? Optional.some({
    message: 'The URL you entered seems to be an email address. Do you want to add the required mailto: prefix?',
    preprocess: (oldData) => ({ ...oldData, href: 'mailto:' + url })
  }) : Optional.none();
};

const tryProtocolTransform = (assumeExternalTargets: AssumeExternalTargets, defaultLinkProtocol: string) => (data: LinkDialogOutput): Optional<Transformer> => {
  const url = data.href;
  const suggestProtocol = (
    assumeExternalTargets === AssumeExternalTargets.WARN && !Utils.hasProtocol(url) ||
    assumeExternalTargets === AssumeExternalTargets.OFF && /^\s*www(\.|\d\.)/i.test(url)
  );

  return suggestProtocol ? Optional.some({
    message: `The URL you entered seems to be an external link. Do you want to add the required ${defaultLinkProtocol}:// prefix?`,
    preprocess: (oldData) => ({ ...oldData, href: defaultLinkProtocol + '://' + url })
  }) : Optional.none();
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

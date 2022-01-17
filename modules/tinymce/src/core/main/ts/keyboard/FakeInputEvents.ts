/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import { clone } from '../events/EventUtils';

interface SpecificsInput {
  data?: null | string;
}

const fireFakeInputEvent = (editor: Editor, inputType: string, specifics: SpecificsInput = {}) => {
  const target = editor.getBody();
  const overrides = {
    bubbles: true,
    composed: true,
    data: null,
    isComposing: false,
    detail: 0,
    view: null,
    target,
    currentTarget: target,
    eventPhase: Event.AT_TARGET,
    originalTarget: target,
    explicitOriginalTarget: target,
    isTrusted: false,
    srcElement: target,
    cancelable: false,
    inputType
  };

  const input = clone(new InputEvent('input'));

  editor.fire('input', { ...input, ...overrides, ...specifics });
};

const fireFakeBeforeInputEvent = (editor: Editor, inputType: string, specifics: SpecificsInput = {}): InputEvent => {
  const target = editor.getBody();
  const overrides = {
    bubbles: true,
    composed: true,
    data: null,
    isComposing: false,
    detail: 0,
    view: null,
    target,
    currentTarget: target,
    eventPhase: Event.AT_TARGET,
    originalTarget: target,
    explicitOriginalTarget: target,
    isTrusted: false,
    srcElement: target,
    cancelable: false,
    inputType
  };

  const input = clone(new InputEvent('beforeinput'));

  return editor.fire('beforeinput', { ...input, ...overrides, ...specifics });
};

export {
  fireFakeInputEvent,
  fireFakeBeforeInputEvent
};

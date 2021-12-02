/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import { clone } from '../events/EventUtils';

interface SpecificsInput {
  inputType: string;
  cancelable?: boolean;
  data?: null | string;
}

const fireFakeInputEvent = (editor: Editor, specifics: SpecificsInput, event: KeyboardEvent) =>
  () => {
    const overrides = {
      bubbles: true,
      composed: true,
      data: null,
      isComposing: false,
      detail: 0,
      view: event.view,
      target: event.target,
      currentTarget: event.currentTarget,
      eventPhase: event.eventPhase,
      originalTarget: event.target,
      explicitOriginalTarget: event.target,
      isTrusted: event.isTrusted,
      srcElement: event.srcElement,
      metaKey: event.metaKey
    };

    const input = clone(new InputEvent('input'));

    editor.fire('input', { ...input, ...overrides, ...specifics });

    event.preventDefault();
  };

export {
  fireFakeInputEvent
};

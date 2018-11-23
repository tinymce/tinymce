/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Env from '../Env';
import { KeyboardEvent } from '@ephox/dom-globals';

/**
 * This file exposes a set of the common KeyCodes for use. Please grow it as needed.
 */

export default {
  BACKSPACE: 8,
  DELETE: 46,
  DOWN: 40,
  ENTER: 13,
  LEFT: 37,
  RIGHT: 39,
  SPACEBAR: 32,
  TAB: 9,
  UP: 38,

  modifierPressed (e: KeyboardEvent): boolean {
    return e.shiftKey || e.ctrlKey || e.altKey || this.metaKeyPressed(e);
  },

  metaKeyPressed (e: KeyboardEvent): boolean {
    // Check if ctrl or meta key is pressed. Edge case for AltGr on Windows where it produces ctrlKey+altKey states
    return (Env.mac ? e.metaKey : e.ctrlKey && !e.altKey);
  }
};
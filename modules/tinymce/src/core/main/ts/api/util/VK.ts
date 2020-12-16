/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Env from '../Env';

interface KeyboardLikeEvent {
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

interface VK {
  BACKSPACE: number;
  DELETE: number;
  DOWN: number;
  ENTER: number;
  LEFT: number;
  RIGHT: number;
  SPACEBAR: number;
  TAB: number;
  UP: number;
  END: number;
  HOME: number;

  modifierPressed: (e: KeyboardLikeEvent) => boolean;
  metaKeyPressed: (e: KeyboardLikeEvent) => boolean;
}

/**
 * This file exposes a set of the common KeyCodes for use. Please grow it as needed.
 */

const VK: VK = {
  BACKSPACE: 8,
  DELETE: 46,
  DOWN: 40,
  ENTER: 13,
  LEFT: 37,
  RIGHT: 39,
  SPACEBAR: 32,
  TAB: 9,
  UP: 38,
  END: 35,
  HOME: 36,

  modifierPressed: (e: KeyboardLikeEvent): boolean => {
    return e.shiftKey || e.ctrlKey || e.altKey || VK.metaKeyPressed(e);
  },

  metaKeyPressed: (e: KeyboardLikeEvent): boolean => {
    // Check if ctrl or meta key is pressed. Edge case for AltGr on Windows where it produces ctrlKey+altKey states
    return (Env.mac ? e.metaKey : e.ctrlKey && !e.altKey);
  }
};

export default VK;

/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Obj, Type } from '@ephox/katamari';

export interface PartialEvent {
  readonly type?: string;
  readonly target?: any;
  readonly srcElement?: any;
  readonly isDefaultPrevented?: () => boolean;
  readonly preventDefault?: () => void;
  readonly isPropagationStopped?: () => boolean;
  readonly stopPropagation?: () => void;
  readonly isImmediatePropagationStopped?: () => boolean;
  readonly stopImmediatePropagation?: () => void;
  readonly composedPath?: () => EventTarget[];
  returnValue?: boolean;
  defaultPrevented?: boolean;
  cancelBubble?: boolean;
}

export type NormalizedEvent<E, T = any> = E & {
  readonly type: string;
  readonly target: T;
  readonly isDefaultPrevented: () => boolean;
  readonly preventDefault: () => void;
  readonly isPropagationStopped: () => boolean;
  readonly stopPropagation: () => void;
  readonly isImmediatePropagationStopped: () => boolean;
  readonly stopImmediatePropagation: () => void;
};

// Note: The values here aren't used. This is just used as a hash map to see if the key exists
const deprecated: Record<string, boolean> = {
  keyLocation: true,
  layerX: true,
  layerY: true,
  returnValue: true,
  webkitMovementX: true,
  webkitMovementY: true,
  keyIdentifier: true,
  mozPressure: true
};

// Note: We can't rely on `instanceof` here as it won't work if the event was fired from another window.
// Additionally, the constructor name might be `MouseEvent` or similar so we can't rely on the constructor name.
const isNativeEvent = (event: PartialEvent) =>
  event instanceof Event || Type.isFunction((event as any).initEvent);

// Checks if it is our own isDefaultPrevented function
const hasIsDefaultPrevented = (event: PartialEvent) =>
  event.isDefaultPrevented === Fun.always || event.isDefaultPrevented === Fun.never;

// An event needs normalizing if it doesn't have the prevent default function or if it's a native event
const needsNormalizing = (event: PartialEvent) =>
  Type.isNullable(event.preventDefault) || isNativeEvent(event);

const clone = <T extends PartialEvent>(originalEvent: T, data?: T): T => {
  const event: any = data ?? {};

  // Copy all properties from the original event
  for (const name in originalEvent) {
    // Some properties are deprecated and produces a warning so don't include them
    if (!Obj.has(deprecated, name)) {
      event[name] = originalEvent[name];
    }
  }

  // The composed path can't be cloned, so delegate instead
  if (Type.isNonNullable(event.composedPath)) {
    event.composedPath = () => originalEvent.composedPath();
  }

  return event as T;
};

const normalize = <T extends PartialEvent>(type: string, originalEvent: T, fallbackTarget: any, data?: T): NormalizedEvent<T> => {
  const event: any = clone(originalEvent, data);
  event.type = type;

  // Normalize target IE uses srcElement
  if (Type.isNullable(event.target)) {
    event.target = event.srcElement ?? fallbackTarget;
  }

  if (needsNormalizing(originalEvent)) {
    // Add preventDefault method
    event.preventDefault = () => {
      event.defaultPrevented = true;
      event.isDefaultPrevented = Fun.always;

      // Execute preventDefault on the original event object
      if (Type.isFunction(originalEvent.preventDefault)) {
        originalEvent.preventDefault();
      } else if (isNativeEvent(originalEvent)) {
        originalEvent.returnValue = false; // IE
      }
    };

    // Add stopPropagation
    event.stopPropagation = () => {
      event.cancelBubble = true;
      event.isPropagationStopped = Fun.always;

      // Execute stopPropagation on the original event object
      if (Type.isFunction(originalEvent.stopPropagation)) {
        originalEvent.stopPropagation();
      } else if (isNativeEvent(originalEvent)) {
        originalEvent.cancelBubble = true; // IE
      }
    };

    // Add stopImmediatePropagation
    event.stopImmediatePropagation = () => {
      event.isImmediatePropagationStopped = Fun.always;
      event.stopPropagation();
    };

    // Add event delegation states
    if (!hasIsDefaultPrevented(event)) {
      event.isDefaultPrevented = event.defaultPrevented === true ? Fun.always : Fun.never;
      event.isPropagationStopped = event.cancelBubble === true ? Fun.always : Fun.never;
      event.isImmediatePropagationStopped = Fun.never;
    }
  }

  return event as NormalizedEvent<T>;
};

export {
  clone,
  normalize
};

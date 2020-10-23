/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { CustomEvent } from '@ephox/alloy';
import { ImageResult } from '@ephox/imagetools';
import { Fun, Id, Optional } from '@ephox/katamari';
import { formActionEvent } from '../../general/FormEvents';

interface WithDirection {
  readonly direction: number;
}

interface WithSwap {
  readonly swap: () => void;
}

interface WithTransform {
  readonly transform: (ir: ImageResult) => Promise<ImageResult>;
}

export interface ImageToolsZoomEvent extends CustomEvent, WithDirection { }
export interface ImageToolsUndoEvent extends CustomEvent, WithDirection { }
export interface ImageToolsRedoEvent extends CustomEvent, WithDirection { }
export interface ImageToolsApplyEvent extends CustomEvent, WithSwap { }
export interface ImageToolsBackEvent extends CustomEvent { }
export interface ImageToolsSwapEvent extends CustomEvent, WithSwap {
  readonly transform: Optional<(ir: ImageResult) => Promise<ImageResult>>;
}
export interface ImageToolsTransformEvent extends CustomEvent, WithTransform { }
export interface ImageToolsTransformApplyEvent extends CustomEvent, WithSwap, WithTransform { }

const undo = Fun.constant(Id.generate('undo'));
const redo = Fun.constant(Id.generate('redo'));
const zoom = Fun.constant(Id.generate('zoom'));

const back = Fun.constant(Id.generate('back'));
const apply = Fun.constant(Id.generate('apply'));
const swap = Fun.constant(Id.generate('swap'));

const transform = Fun.constant(Id.generate('transform'));
const tempTransform = Fun.constant(Id.generate('temp-transform'));
const transformApply = Fun.constant(Id.generate('transform-apply'));

const internal = {
  undo,
  redo,
  zoom,

  back,
  apply,
  swap,

  transform,
  tempTransform,
  transformApply
};

const saveState = Fun.constant('save-state');
const disable = Fun.constant('disable');
const enable = Fun.constant('enable');

const external = {
  formActionEvent,
  saveState,
  disable,
  enable
};

export {
  internal,
  external
};

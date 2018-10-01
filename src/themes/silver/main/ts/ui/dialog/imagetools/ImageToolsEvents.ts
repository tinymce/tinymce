import { Id, Fun } from '@ephox/katamari';
import { formActionEvent } from '../../general/FormEvents';

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
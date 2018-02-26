import { Struct } from '@ephox/katamari';

const decision = Struct.immutableBag(['x', 'y', 'width', 'height', 'maxHeight', 'direction', 'classes', 'label', 'candidateYforTest'], []);
const css = Struct.immutable('position', 'left', 'top', 'right', 'bottom');

export {
  decision,
  css
};
import { Struct } from '@ephox/katamari';

var decision = Struct.immutableBag(['x', 'y', 'width', 'height', 'maxHeight', 'direction', 'classes', 'label', 'candidateYforTest'], []);
var css = Struct.immutable('position', 'left', 'top', 'right', 'bottom');

export default <any> {
  decision: decision,
  css: css
};
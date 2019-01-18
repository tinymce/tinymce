import { Struct } from '@ephox/katamari';

var point = Struct.immutable('element', 'offset');
var delta = Struct.immutable('element', 'deltaOffset');
var range = Struct.immutable('element', 'start', 'finish');
var points = Struct.immutable('begin', 'end');
var text = Struct.immutable('element', 'text');

export default {
  point: point,
  delta: delta,
  range: range,
  points: points,
  text: text
};
import { Contracts } from '@ephox/katamari';

var mode = Contracts.exactly([
  'compare',
  'extract',
  'mutate',
  'sink'
]);

var sink = Contracts.exactly([
  'element',
  'start',
  'stop',
  'destroy'
]);

var api = Contracts.exactly([
  'forceDrop',
  'drop',
  'move',
  'delayDrop'
]);

export default <any> {
  mode: mode,
  sink: sink,
  api: api
};
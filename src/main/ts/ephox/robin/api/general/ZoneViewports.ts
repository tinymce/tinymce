import { Fun } from '@ephox/katamari';
import ZonePosition from './ZonePosition';

var anything = {
  assess: ZonePosition.inView
};

export default <any> {
  anything: Fun.constant(anything)
};
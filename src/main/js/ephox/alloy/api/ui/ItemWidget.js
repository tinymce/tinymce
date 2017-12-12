import WidgetParts from '../../menu/build/WidgetParts';
import AlloyParts from '../../parts/AlloyParts';
import { Fun } from '@ephox/katamari';

var parts = AlloyParts.generate(WidgetParts.owner(), WidgetParts.parts());

export default <any> {
  parts: Fun.constant(parts)
};
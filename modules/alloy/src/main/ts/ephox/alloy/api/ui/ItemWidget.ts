import { Fun } from '@ephox/katamari';

import * as WidgetParts from '../../menu/build/WidgetParts';
import * as AlloyParts from '../../parts/AlloyParts';

const parts: () => AlloyParts.GeneratedParts = Fun.constant(AlloyParts.generate(WidgetParts.owner(), WidgetParts.parts()));

export {
  parts
};
import { Fun } from '@ephox/katamari';

import * as WidgetParts from '../../menu/build/WidgetParts';
import * as AlloyParts from '../../parts/AlloyParts';
import { PartTypeAdt } from '../../parts/PartType';
import { LooseSpec, SimpleOrSketchSpec } from '../../api/component/SpecTypes';

const parts: () => AlloyParts.GeneratedParts = Fun.constant(AlloyParts.generate(WidgetParts.owner(), WidgetParts.parts()));

export {
  parts
};
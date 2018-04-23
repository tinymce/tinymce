import { Fun } from '@ephox/katamari';

import * as WidgetParts from '../../menu/build/WidgetParts';
import * as AlloyParts from '../../parts/AlloyParts';
import { AlloyComponentsSpec, SketchSpec } from './Sketcher';

export interface ItemWidget {
  widget: (config: AlloyComponentsSpec) => SketchSpec;
}

export type ItemWidgetParts = () => ItemWidget;

const parts = Fun.constant(AlloyParts.generate(WidgetParts.owner(), WidgetParts.parts()));

export {
  parts
};
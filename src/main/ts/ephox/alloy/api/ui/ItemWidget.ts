import { Fun } from '@ephox/katamari';

import * as WidgetParts from '../../menu/build/WidgetParts';
import * as AlloyParts from '../../parts/AlloyParts';

export interface ItemWidget {
  widget: (config) => any;
}

export type ItemWidgetParts = () => ItemWidget;

const parts = Fun.constant(AlloyParts.generate(WidgetParts.owner(), WidgetParts.parts())) as ItemWidgetParts;

export {
  parts
};
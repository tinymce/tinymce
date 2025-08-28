import * as WidgetParts from '../../menu/build/WidgetParts';
import * as AlloyParts from '../../parts/AlloyParts';

const parts: AlloyParts.GeneratedParts = AlloyParts.generate(WidgetParts.owner(), WidgetParts.parts());

export {
  parts
};

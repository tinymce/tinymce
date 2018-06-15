import { RawDomSchema, AlloySpec } from "../../api/component/SpecTypes";
import { TogglingConfigSpec } from "../../behaviour/toggling/TogglingTypes";
import { SketchBehaviours } from "../../api/component/SketchBehaviours";

export interface ItemDataTuple {
  value: string;
  text: string;
}

export type ItemSpec = WidgetItemSpec | SeparatorItemSpec | NormalItemSpec;

export interface WidgetItemSpec {
  type: 'widget';
  uid?: string;
  data?: ItemDataTuple // why is this necessary?
  dom: RawDomSchema;
  autofocus?: boolean;
  domModification?: any;
}

export interface SeparatorItemSpec {
  type: 'separator';
  components: AlloySpec[];
  dom: RawDomSchema;
}

export interface NormalItemSpec {
  type: 'item';
  data: ItemDataTuple;
  components: AlloySpec[];
  dom: RawDomSchema;
  // INVESTIGATE: this might not be right
  toggling?: TogglingConfigSpec;
  itemBehaviours: SketchBehaviours;
  ignoreFocus?: boolean;
  // TYPIFY
  domModification?: any;
  eventOrder: Record<string, string[]>;
}
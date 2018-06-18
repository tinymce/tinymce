import { Option } from '@ephox/katamari';
import { CompositeSketchDetail } from 'ephox/alloy/api/ui/Sketcher';

import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { TogglingConfigSpec } from '../../behaviour/toggling/TogglingTypes';
import { DomModification, DomModificationSpec } from 'ephox/alloy/dom/DomModification';

export interface ItemDataTuple {
  value: string;
  text: string;
}

export type ItemSpec = WidgetItemSpec | SeparatorItemSpec | NormalItemSpec;

export interface WidgetItemSpec {
  type: 'widget';
  uid?: string;
  components?: AlloySpec[];
  data?: ItemDataTuple // why is this necessary?
  dom: RawDomSchema;
  autofocus?: boolean;
  domModification?: DomModificationSpec;
}

export interface WidgetItemDetail extends ItemDetail, CompositeSketchDetail {
  dom: () => RawDomSchema;
  components: () => AlloySpec[];
  builder: () => <WidgetItemInfo>(buildInfo: WidgetItemInfo) => AlloySpec;
  autofocus: () => boolean;
  domModification: () => { };
  data: () => ItemDataTuple;
}

export interface SeparatorItemSpec {
  type: 'separator';
  components: AlloySpec[];
  dom: RawDomSchema;
}


export interface SeparatorItemDetail extends ItemDetail {
  dom: () => RawDomSchema;
  components: () => AlloySpec[];
  builder: () => <SeparatorItemInfo>(buildInfo: SeparatorItemInfo) => AlloySpec;
}

export interface NormalItemSpec {
  type: 'item';
  data: ItemDataTuple;
  components?: AlloySpec[];
  dom: RawDomSchema;
  // INVESTIGATE: this might not be right
  toggling?: Partial<TogglingConfigSpec>;
  itemBehaviours?: SketchBehaviours;
  ignoreFocus?: boolean;
  domModification?: DomModificationSpec;
  eventOrder?: Record<string, string[]>;
}

export interface NormalItemDetail extends ItemDetail {
  data: () => RawDomSchema;
  components: () => AlloySpec[];
  dom: () => RawDomSchema;
  // INVESTIGATE: () => this might not be right
  toggling: () => Option<Partial<TogglingConfigSpec>>;
  itemBehaviours: () => SketchBehaviours;
  ignoreFocus?: () => boolean;
  domModification: () => DomModification;
  eventOrder: () => Record<string, string[]>;
  builder: () => <NormalItemInfo>(buildInfo: NormalItemInfo) => AlloySpec;
}

export interface ItemDetail {
  builder: () => <B extends ItemDetail>(buildInfo: B) => AlloySpec;
}

export interface ItemBuilder<B extends ItemDetail> {
  builder: () => (buildInfo: B) => AlloySpec;
}
import type { Optional } from '@ephox/katamari';

import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import type { CompositeSketchDetail } from '../../api/ui/Sketcher';
import type { TogglingConfigSpec } from '../../behaviour/toggling/TogglingTypes';
import type { DomModification, DomModificationSpec } from '../../dom/DomModification';

export interface ItemDataTuple {
  value: string;
  meta?: {
    text?: string;
  };
}

export interface ItemTogglingConfigSpec extends TogglingConfigSpec {
  readonly exclusive?: boolean;
}

export type ItemSpec = WidgetItemSpec | SeparatorItemSpec | NormalItemSpec;

export interface WidgetItemSpec {
  type: 'widget';
  uid?: string;
  components?: AlloySpec[];
  data: ItemDataTuple; // why is this necessary?
  dom: RawDomSchema;
  autofocus?: boolean;
  widgetBehaviours?: AlloyBehaviourRecord;
  ignoreFocus?: boolean;
  domModification?: DomModificationSpec;
}

export interface WidgetItemDetail extends ItemDetail, CompositeSketchDetail {
  dom: RawDomSchema;
  components: AlloySpec[];
  builder: <WidgetItemInfo>(buildInfo: WidgetItemInfo) => AlloySpec;
  autofocus: boolean;
  domModification: { };
  widgetBehaviours: SketchBehaviours;
  ignoreFocus: boolean;
  data: ItemDataTuple;
}

export interface SeparatorItemSpec {
  type: 'separator';
  components: AlloySpec[];
  dom: RawDomSchema;
}

export interface SeparatorItemDetail extends ItemDetail {
  dom: RawDomSchema;
  components: AlloySpec[];
  builder: <SeparatorItemInfo>(buildInfo: SeparatorItemInfo) => AlloySpec;
}

export interface NormalItemSpec {
  type: 'item';
  data: ItemDataTuple;
  components?: AlloySpec[];
  dom: RawDomSchema;
  toggling?: Partial<ItemTogglingConfigSpec>;
  itemBehaviours?: AlloyBehaviourRecord;
  ignoreFocus?: boolean;
  domModification?: DomModificationSpec;
  eventOrder?: Record<string, string[]>;
  hasSubmenu?: boolean;
}

export interface NormalItemDetail extends ItemDetail {
  data: ItemDataTuple;
  components: AlloySpec[];
  dom: RawDomSchema;
  toggling: Optional<Partial<ItemTogglingConfigSpec>>;
  itemBehaviours: SketchBehaviours;
  ignoreFocus?: boolean;
  domModification: DomModification;
  eventOrder: Record<string, string[]>;
  builder: <NormalItemInfo>(buildInfo: NormalItemInfo) => AlloySpec;
  hasSubmenu: boolean;
  role: Optional<string>;
}

export interface ItemDetail {
  builder: <B extends ItemDetail>(buildInfo: B) => AlloySpec;
}

export interface ItemBuilder<B extends ItemDetail> {
  builder: (buildInfo: B) => AlloySpec;
}

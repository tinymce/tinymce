import type { Optional } from '@ephox/katamari';

import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { OptionalDomSchema, RawDomSchema, SimpleOrSketchSpec, SketchSpec } from '../../api/component/SpecTypes';
import type { CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import type { ConfiguredPart } from '../../parts/AlloyParts';

export interface SlotContainerDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  slotBehaviours: SketchBehaviours;
  eventOrder: Record<string, string[]>;
}

export interface SlotContainerSpec extends CompositeSketchSpec {
  uid?: string;
  dom?: OptionalDomSchema;
  slotBehaviours?: AlloyBehaviourRecord;
  eventOrder?: Record<string, string[]>;
}

export type SlotContainerSpecBuilder = (parts: SlotContainerParts) => SlotContainerSpec;

export interface SlotContainerParts {
  slot: (name: string, config: SimpleOrSketchSpec) => ConfiguredPart;
  record(): string[];
}

export interface SlotContainerApis {
  getSlotNames: (container: AlloyComponent) => string[];
  getSlot: (container: AlloyComponent, key: string) => Optional<AlloyComponent>;
  isShowing: (comp: AlloyComponent, key: string) => boolean;
  showSlot: (container: AlloyComponent, key: string) => void;
  hideSlot: (container: AlloyComponent, key: string) => void;
  hideAllSlots: (container: AlloyComponent) => void;
}

export interface SlotContainerSketcher extends SlotContainerApis {
  sketch: (sSpec: SlotContainerSpecBuilder) => SketchSpec;
}

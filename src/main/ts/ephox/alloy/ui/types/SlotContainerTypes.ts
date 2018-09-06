import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { OptionalDomSchema, RawDomSchema, SimpleOrSketchSpec, SketchSpec } from '../../api/component/SpecTypes';
import { CompositeSketchSpec, SingleSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';
import { ConfiguredPart } from '../../parts/AlloyParts';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';

export interface SlotContainerDetail extends CompositeSketchDetail  {
  uid: () => string;
  dom: () => RawDomSchema;
  slotBehaviours: () => SketchBehaviours;
  eventOrder: () => Record<string, string[]>;
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
  getSlot: (container: AlloyComponent, key: string) => Option<AlloyComponent>;
  isShowing: (comp: AlloyComponent, key: string) => boolean;
  showSlot: (container: AlloyComponent, key: string) => void;
  showSlots: (container: AlloyComponent, keys: string[]) => void;
  hideSlot: (container: AlloyComponent, key: string) => void;
  hideSlots: (container: AlloyComponent, keys: string[]) => void;
  hideAllSlots: (container: AlloyComponent) => void;
  listSlots: (container: AlloyComponent) => string[];
  listShowing: (container: AlloyComponent) => string[];
}

export interface SlotContainerSketcher extends SlotContainerApis {
  sketch: (sSpec: SlotContainerSpecBuilder) => SketchSpec;
}

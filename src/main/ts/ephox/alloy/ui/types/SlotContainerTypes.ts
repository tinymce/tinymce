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

export interface SlotContainerSketcher {
  getSlot: (container: AlloyComponent, key: string) => Option<AlloyComponent>;
  showSlot: (container: AlloyComponent, key: string) => void;
  hideSlot: (container: AlloyComponent, key: string) => void;
  sketch: (sSpec: SlotContainerSpecBuilder) => SketchSpec;
}

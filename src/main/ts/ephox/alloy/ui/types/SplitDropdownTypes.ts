import { Option, Result, Future } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec, LooseSpec } from '../../api/component/SpecTypes';
import { SingleSketch, CompositeSketchSpec, CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';
import { DropdownDetail } from 'ephox/alloy/ui/types/DropdownTypes';

export interface SplitDropdownDetail extends DropdownDetail {
  uid: () => string;
  // FIX: Completed DOM tpye.
  dom: () => any;
  components: () => AlloySpec[ ];
  splitDropdownBehaviours: () => SketchBehaviours;

  onExecute: () => (comp: AlloyComponent, button: AlloyComponent) => void;
  onItemExecute: () => (comp: AlloyComponent, button: AlloyComponent, item: AlloyComponent) => void;
}

export interface SplitDropdownSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  splitDropdownBehaviours?: AlloyBehaviourRecord;

  onExecute: (comp: AlloyComponent, button: AlloyComponent) => void;
  onItemExecute: (comp: AlloyComponent, button: AlloyComponent, item: AlloyComponent) => void;

  onOpen?: (anchor, comp: AlloyComponent, menu: AlloyComponent) => void;

  lazySink?: () => Result<AlloyComponent, Error>;
  fetch: (comp: AlloyComponent) => Future<LooseSpec>;
  toggleClass: string;

  parts: {
    // INVESTIGATE using Partial<TieredMenuSpec> here.
    menu: LooseSpec;
  }
}

export interface SplitDropdownSketcher extends CompositeSketch<SplitDropdownSpec, SplitDropdownDetail> { }
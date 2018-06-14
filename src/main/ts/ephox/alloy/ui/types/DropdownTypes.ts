import { Option, Future, Result } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec, LooseSpec } from '../../api/component/SpecTypes';
import { SingleSketch, CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

export interface DropdownDetail extends CompositeSketchDetail {
  uid: () => string;
  // TYPIFY: Completed DOM tpye.
  dom: () => any;
  components: () => AlloySpec[ ];
  dropdownBehaviours: () => SketchBehaviours;
  role: () => Option<string>;
  eventOrder: () => Record<string, string[]>
  // TYPIFY: Types
  fetch: () => (comp: AlloyComponent) => Future<LooseSpec>;
  onOpen: () => (anchor, comp: AlloyComponent, menu: AlloyComponent) => void;

  onExecute: () => (sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;

  toggleClass: () => string;
  lazySink?: () => Result<AlloyComponent, Error>
  matchWidth: () => boolean;
}

export interface DropdownSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  fetch: () => any;
  onOpen?: () => void;
  dropdownBehaviours?: AlloyBehaviourRecord;
  onExecute?: (sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;

  toggleClass: string;
  lazySink?: any;
  parts: {
    // INVESTIGATE using Partial<TieredMenuSpec> here.
    menu: LooseSpec;
  }
  matchWidth?: boolean;
  role?: string;
}

export interface DropdownSketcher extends CompositeSketch<CompositeSketchSpec, CompositeSketchDetail> { }
import { Future, Option, Result } from '@ephox/katamari';
import { TieredData } from 'ephox/alloy/api/Main';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, LooseSpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

export interface DropdownDetail extends CompositeSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  dropdownBehaviours: () => SketchBehaviours;
  role: () => Option<string>;
  eventOrder: () => Record<string, string[]>
  fetch: () => (comp: AlloyComponent) => Future<TieredData>;
  onOpen: () => (anchor, comp: AlloyComponent, menu: AlloyComponent) => void;

  onExecute: () => (sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;

  toggleClass: () => string;
  lazySink?: () => Option<() => Result<AlloyComponent, Error>>
  matchWidth: () => boolean;
}

export interface DropdownSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  fetch: (comp: AlloyComponent) => Future<TieredData>;
  onOpen?: (anchor, comp: AlloyComponent, menu: AlloyComponent) => void;
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
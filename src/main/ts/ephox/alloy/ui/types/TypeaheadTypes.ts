import { Option, Cell, Result, Future } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec, LooseSpec } from '../../api/component/SpecTypes';
import { SingleSketch, CompositeSketchSpec, CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';
import { DropdownDetail } from 'ephox/alloy/ui/types/DropdownTypes';
import { InputDetail } from 'ephox/alloy/ui/types/InputTypes';

export interface TypeaheadDetail extends DropdownDetail, InputDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  minChars: () => number;

  typeaheadBehaviours: () => SketchBehaviours;
  dismissOnBlur: () => boolean;

  markers: () => {
    openClass: () => string;
  };
  previewing: () => Cell<boolean>;
}

export interface TypeaheadSpec extends CompositeSketchSpec {
  // TODO: Add everything else.
  uid?: string;
  lazySink?: (comp: AlloyComponent) => Result<AlloyComponent, Error>;
  // TYPIFY
  fetch: (comp: AlloyComponent) => Future<LooseSpec>;
  dom: RawDomSchema;
  components?: AlloySpec[];
  typeaheadBehaviours?: AlloyBehaviourRecord;

  minChars?: number;
  markers: {
    openClass: string;
  }

  parts: {
    // INVESTIGATE using Partial<TieredMenuSpec> here.
    menu: LooseSpec;
  }

  dismissOnBlur?: boolean;
  onExecute?: (sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;

  data?: {
    value: string;
    text: string;
  }
}

export interface TypeaheadSketcher extends CompositeSketch<TypeaheadSpec, TypeaheadDetail> { }
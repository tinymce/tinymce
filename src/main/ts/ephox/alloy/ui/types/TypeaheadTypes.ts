import { Cell, Future, Option, Result } from '@ephox/katamari';
import { DropdownDetail } from 'ephox/alloy/ui/types/DropdownTypes';
import { InputDetail } from 'ephox/alloy/ui/types/InputTypes';
import { TieredMenuSpec } from 'ephox/alloy/ui/types/TieredMenuTypes';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, LooseSpec, RawDomSchema, StructDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchSpec } from '../../api/ui/Sketcher';

export interface TypeaheadDetail extends DropdownDetail, InputDetail<TypeaheadData> {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  minChars: () => number;

  typeaheadBehaviours: () => SketchBehaviours;
  dismissOnBlur: () => boolean;

  data: () => Option<TypeaheadData>;

  markers: () => {
    openClass: () => string;
  };
  previewing: () => Cell<boolean>;
}

export interface TypeaheadData {
  value: string;
  text: string;
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
    menu: Partial<TieredMenuSpec>;
  }

  dismissOnBlur?: boolean;
  onExecute?: (sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;

  data?: TypeaheadData;
}

export interface TypeaheadSketcher extends CompositeSketch<TypeaheadSpec, TypeaheadDetail> { }
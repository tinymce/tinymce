import { Cell, Future, Option, Result } from '@ephox/katamari';
import { ItemDataTuple } from '../../ui/types/ItemTypes';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { CommonDropdownDetail } from '../../ui/types/DropdownTypes';
import { InputDetail } from '../../ui/types/InputTypes';
import { TieredData, TieredMenuSpec } from '../../ui/types/TieredMenuTypes';


export interface TypeaheadModelDetail {
  getDisplayText: () => (item: TypeaheadData) => string;
  selectsOver: () => boolean;
}


export interface TypeaheadDetail extends CommonDropdownDetail<TieredData>, InputDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  minChars: () => number;

  model: () => TypeaheadModelDetail;
  sandboxClasses: () => string[];

  typeaheadBehaviours: () => SketchBehaviours;
  onExecute: () => (sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;
  dismissOnBlur: () => boolean;

  data: () => Option<string>;
  dataset: () => Record<string, any>;

  markers: () => {
    openClass: () => string;
  };
  previewing: () => Cell<boolean>;
}

export interface TypeaheadData extends ItemDataTuple {
  [key: string]: any;
}

export interface TypeaheadSpec extends CompositeSketchSpec {
  // TODO: Add everything else.
  uid?: string;
  lazySink?: (comp: AlloyComponent) => Result<AlloyComponent, Error>;
  fetch: (comp: AlloyComponent) => Future<TieredData>;
  dom: RawDomSchema;
  components?: AlloySpec[];
  typeaheadBehaviours?: AlloyBehaviourRecord;
  sandboxClasses?: string[];

  minChars?: number;
  markers: {
    openClass: string;
  };

  model?: {
    getDisplayText?: (itemData: TypeaheadData) => string;
    selectsOver?: boolean;
  },

  parts: {
    menu: Partial<TieredMenuSpec>;
  };

  dismissOnBlur?: boolean;
  onExecute?: (sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;

  data?: string;
  dataset?: Record<string, any>;
}

export interface TypeaheadSketcher extends CompositeSketch<TypeaheadSpec, TypeaheadDetail> { }
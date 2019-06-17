import { Cell, Future, Option, Result } from '@ephox/katamari';
import { ItemDataTuple } from '../../ui/types/ItemTypes';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { CommonDropdownDetail } from '../../ui/types/DropdownTypes';
import { InputDetail } from '../../ui/types/InputTypes';
import { TieredData, TieredMenuSpec } from '../../ui/types/TieredMenuTypes';

export interface TypeaheadModelDetail {
  getDisplayText: (item: TypeaheadData) => string;
  selectsOver: boolean;
  populateFromBrowse: boolean;
}

// TODO: CommonDropdownDetail has getHotspot. So all things extending it
// need to have a schema setting for getHotspot
export interface TypeaheadDetail extends CommonDropdownDetail<TieredData>, InputDetail {
  uid: string;
  components: AlloySpec[ ];
  minChars: number;
  responseTime: number;

  model: TypeaheadModelDetail;

  typeaheadBehaviours: SketchBehaviours;
  onExecute: (sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;
  onItemExecute: (typeahead: AlloyComponent, sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;
  dismissOnBlur: boolean;

  initialData: Option<TypeaheadData>;

  markers: {
    openClass: string;
  };
  previewing: Cell<boolean>;
}

export interface TypeaheadData extends ItemDataTuple {
  [key: string]: any;
}

export interface TypeaheadSpec extends CompositeSketchSpec {
  // TODO: Add everything else.
  uid?: string;
  lazySink?: (comp: AlloyComponent) => Result<AlloyComponent, Error>;
  fetch: (comp: AlloyComponent) => Future<Option<TieredData>>;
  components?: AlloySpec[];
  typeaheadBehaviours?: AlloyBehaviourRecord;
  sandboxClasses?: string[];
  sandboxBehaviours?: AlloyBehaviourRecord;
  getHotspot?: (comp: AlloyComponent) => Option<AlloyComponent>;
  inputClasses?: string[];
  inputAttributes?: { };
  inputStyles?: { };

  minChars?: number;
  responseTime?: number;
  markers: {
    openClass: string;
  };
  matchWidth?: boolean;
  useMinWidth?: boolean;

  model?: {
    getDisplayText?: (itemData: TypeaheadData) => string;
    selectsOver?: boolean;
    populateFromBrowser?: boolean;
  };

  parts: {
    menu: Partial<TieredMenuSpec>;
  };

  dismissOnBlur?: boolean;
  onExecute?: (sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;
  onItemExecute?: (typeahead: AlloyComponent, sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;

  initialData?: TypeaheadData;
}

export interface TypeaheadSketcher extends CompositeSketch<TypeaheadSpec, TypeaheadDetail> { }
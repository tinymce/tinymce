import { Cell, Future, Optional, Result } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { CommonDropdownDetail } from './DropdownTypes';
import { InputDetail, InputSpec } from './InputTypes';
import { ItemDataTuple } from './ItemTypes';
import { TieredData, TieredMenuSpec } from './TieredMenuTypes';

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

  initialData: Optional<TypeaheadData>;

  markers: {
    openClass: string;
  };
  previewing: Cell<boolean>;
}

export interface TypeaheadData extends ItemDataTuple {
  [key: string]: any;
}

export interface TypeaheadSpec extends CompositeSketchSpec, InputSpec {
  // TODO: Add everything else.
  uid?: string;
  lazySink?: (comp: AlloyComponent) => Result<AlloyComponent, Error>;
  fetch: (comp: AlloyComponent) => Future<Optional<TieredData>>;
  components?: AlloySpec[];
  typeaheadBehaviours?: AlloyBehaviourRecord;
  sandboxClasses?: string[];
  sandboxBehaviours?: AlloyBehaviourRecord;
  getHotspot?: (comp: AlloyComponent) => Optional<AlloyComponent>;

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
    populateFromBrowse?: boolean;
  };

  parts: {
    menu: Partial<TieredMenuSpec>;
  };

  dismissOnBlur?: boolean;
  onExecute?: (sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;
  onItemExecute?: (typeahead: AlloyComponent, sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;

  initialData?: TypeaheadData;
}

export interface TypeaheadSketcher extends CompositeSketch<TypeaheadSpec> { }

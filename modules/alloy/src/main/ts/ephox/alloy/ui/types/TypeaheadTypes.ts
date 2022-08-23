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

/*
 * Typeahead Model types
 *
 * * selectsOver - when selectsOver is true, then as the user types,
 * if we can find matching "getDisplayText" in one of the items, we will
 * automatically highlight that item, and copy the value from the item
 * into the input, but select the characters from the start of where the user
 * finished typing to the end of the value. This means that the next keystroke
 * will replace the selected text, and the process will continue. In this way,
 * a "selectsOver" model doesn't have much of a "previewing" mode"
 *
 * - populateFromBrowse: when populateFromBrowse is true, then as the user
 * highlights (through hover or navigation ... i.e. not in previewing mode)
 * an item, then the Typeahead input's value will immediately copy that item. It
 * will copy the *value* of that item, not its displayText.
 *
 * - getDisplayText this is what is shown in the Typeahead to the user. It is all
 * maintained by the rather convoluted DataSet Representing system. For more
 * information, see Representing.
 */

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

  // Generate fields that are created by bouldering (and don't exist in TypeaheadSpec)
  previewing: Cell<boolean>;
  // This is required so that we can find the Typeahead from the TieredMenu. We can't rely on just
  // looking up the Typeahead's uid from the system, because the TieredMenu and Input can be in
  // different alloy systems / motherships.
  lazyTypeaheadComp: Cell<Optional<AlloyComponent>>;
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

import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec } from '../../api/component/SpecTypes';
import { SingleSketch, CompositeSketchSpec, CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';
import { ItemSpec } from 'ephox/alloy/ui/types/ItemTypes';
import { MenuConfigSpec } from 'ephox/alloy/keying/KeyingModeTypes';

// FIX: Do this (Fix KeyingConfig here)
export interface MenuMovement {
  config: () => (detail: MenuDetail, movement: MenuMovement) => MenuConfigSpec;
  moveOnTab: () => boolean;
  initSize?: () => {
    numColumns: () => number;
    numRows: () => number;
  }
}

export interface MenuDetail extends CompositeSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  menuBehaviours: () => SketchBehaviours;

  fakeFocus: () => boolean;
  markers: () => {
    item: () => string;
    selectedItem: () => string;
  };

  onHighlight: () =>(comp: AlloyComponent, target: AlloyComponent) => void;
  value: () => string;
  movement: () => MenuMovement;

  // TYPIFY
  focusManager: () => any;
  eventOrder: () => Record<string, string[]>;
}

export interface MenuSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  menuBehaviours?: AlloyBehaviourRecord;

  // TYPIFY
  value: string;
  items: ItemSpec[];

  fakeFocus?: boolean;
  markers: {
    item: string;
    selectedItem: string;
  };

  // Movement?

  onHighlight?: (comp: AlloyComponent, target: AlloyComponent) => void;
  eventOrder?: Record<string, string[]>;
}

export interface MenuSketcher extends CompositeSketch<MenuSpec, MenuDetail> { }
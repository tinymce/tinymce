import { MenuConfigSpec } from '../../keying/KeyingModeTypes';
import { ItemSpec } from '../../ui/types/ItemTypes';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { FocusManager } from '../../api/focus/FocusManagers';
import { EventFormat, CustomEvent } from '../../api/Main';

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

  focusManager: () => FocusManager;
  eventOrder: () => Record<string, string[]>;
}

export interface MenuSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  menuBehaviours?: AlloyBehaviourRecord;

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

export interface MenuItemHoverEvent extends CustomEvent {
  item: () => AlloyComponent;
}
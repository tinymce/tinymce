import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { FocusManager } from '../../api/focus/FocusManagers';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { CustomEvent } from '../../events/SimulatedEvent';
import { FlatgridConfigSpec, MatrixConfigSpec, MenuConfigSpec } from '../../keying/KeyingModeTypes';
import { ItemSpec } from './ItemTypes';

export interface MenuGridMovementSpec {
  mode: 'grid';
  initSize: {
    numColumns: number;
    numRows: number;
  };
}

export interface MenuMatrixMovementSpec {
  mode: 'matrix';
  rowSelector: string;
}

export interface MenuNormalMovementSpec {
  mode: 'menu';
  moveOnTab?: boolean;
}

export type MenuMovementSpec = MenuGridMovementSpec | MenuMatrixMovementSpec | MenuNormalMovementSpec;

// config: (detail: MenuDetail,  movementInfo: MenuMovement) => KeyingConfigSpec
export interface MenuGridMovement {
  mode: 'grid';
  config: (detail: MenuDetail,  movementInfo: MenuMovement) => FlatgridConfigSpec;
  initSize?: {
    numColumns: number;
    numRows: number;
  };
}

export interface MenuMatrixMovement {
  mode: 'matrix';
  config: (detail: MenuDetail,  movementInfo: MenuMovement) => MatrixConfigSpec;
  rowSelector: string;
}

export interface MenuNormalMovement {
  mode: 'menu';
  config: (detail: MenuDetail, movement: MenuMovement) => MenuConfigSpec;
  moveOnTab: boolean;
}

export type MenuMovement = MenuGridMovement | MenuMatrixMovement | MenuNormalMovement;

export interface MenuDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  menuBehaviours: SketchBehaviours;

  fakeFocus: boolean;
  markers: {
    item: string;
    selectedItem: string;
  };

  onHighlight: (comp: AlloyComponent, target: AlloyComponent) => void;
  value: string;
  movement: MenuMovement;

  focusManager: FocusManager;
  eventOrder: Record<string, string[]>;
}

export interface MenuSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  menuBehaviours?: AlloyBehaviourRecord;

  value: string;
  items: ItemSpec[];

  fakeFocus?: boolean;
  focusManager?: FocusManager;
  markers: {
    item: string;
    selectedItem: string;
  };

  movement?: MenuMovementSpec;

  onHighlight?: (comp: AlloyComponent, target: AlloyComponent) => void;
  eventOrder?: Record<string, string[]>;
}

export interface MenuSketcher extends CompositeSketch<MenuSpec, MenuDetail> { }

export interface MenuItemHoverEvent extends CustomEvent {
  item: () => AlloyComponent;
}

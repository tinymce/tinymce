import { Optional } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';
import { LayeredItemTrigger } from '../../menu/layered/LayeredState';
import { ItemDataTuple } from './ItemTypes';
import { MenuSpec } from './MenuTypes';

export interface TieredMenuDetail extends SingleSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  tmenuBehaviours: SketchBehaviours;

  fakeFocus: boolean;

  onHighlightItem: (tmenuComp: AlloyComponent, menuComp: AlloyComponent, itemComp: AlloyComponent) => void;
  onDehighlightItem: (tmenuComp: AlloyComponent, menuComp: AlloyComponent, itemComp: AlloyComponent) => void;

  markers: {
    item: string;
    menu: string;
    backgroundMenu: string;
    selectedMenu: string;
    selectedItem: string;
  };

  onEscape: (comp: AlloyComponent, item: AlloyComponent) => Optional<boolean>;
  onExecute: (comp: AlloyComponent, item: AlloyComponent) => Optional<boolean>;
  onOpenMenu: (comp: AlloyComponent, menu: AlloyComponent) => void;
  onOpenSubmenu: (comp: AlloyComponent, item: AlloyComponent, activeMenu: AlloyComponent, triggeringPath: string[]) => void;
  onCollapseMenu: (comp: AlloyComponent, item: AlloyComponent, activeMenu: AlloyComponent) => void;
  onRepositionMenu: (comp: AlloyComponent, item: AlloyComponent, triggers: LayeredItemTrigger[]) => void;
  onHover: (comp: AlloyComponent, item: AlloyComponent) => void;

  navigateOnHover: boolean;
  highlightOnOpen: HighlightOnOpen;

  stayInDom: boolean;

  eventOrder: Record<string, string[]>;

  data: TieredData;
}

export interface TieredMenuSpec extends SingleSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  tmenuBehaviours?: AlloyBehaviourRecord;

  onEscape: (comp: AlloyComponent, item: AlloyComponent) => Optional<boolean>;
  onExecute: (comp: AlloyComponent, item: AlloyComponent) => Optional<boolean>;
  onOpenMenu: (comp: AlloyComponent, menu: AlloyComponent) => void;
  onOpenSubmenu: (comp: AlloyComponent, item: AlloyComponent, activeMenu: AlloyComponent, triggeringPath: string[]) => void;
  onCollapseMenu?: (comp: AlloyComponent, item: AlloyComponent, activeMenu: AlloyComponent) => void;
  onRepositionMenu?: (comp: AlloyComponent, item: AlloyComponent, triggers: LayeredItemTrigger[]) => void;
  onHover?: (comp: AlloyComponent, item: AlloyComponent) => void;
  onHighlightItem?: (tmenuComp: AlloyComponent, menuComp: AlloyComponent, itemComp: AlloyComponent) => void;
  onDehighlightItem?: (tmenuComp: AlloyComponent, menuComp: AlloyComponent, itemComp: AlloyComponent) => void;

  navigateOnHover?: boolean;
  stayInDom?: boolean;
  highlightOnOpen?: HighlightOnOpen;
  fakeFocus?: boolean;

  eventOrder?: Record<string, string[]>;

  data: TieredData;

  markers: {
    item: string;
    menu: string;
    backgroundMenu: string;
    selectedMenu: string;
    selectedItem: string;
  };
}

export type PartialMenuSpec = Partial<MenuSpec> & {
  dom: MenuSpec['dom'];
  components: MenuSpec['components'];
  items: MenuSpec['items'];
};

export type TieredMenuRecord = Record<string, PartialMenuSpec>;

export enum HighlightOnOpen {
  HighlightMenuAndItem,
  HighlightJustMenu,
  HighlightNone
}

export interface TieredData {
  primary: string;
  menus: TieredMenuRecord;
  expansions: Record<string, string>;
}

export interface TieredMenuApis {
  collapseMenu: (tmenu: AlloyComponent) => void;
  highlightPrimary: (tmenu: AlloyComponent) => void;
  repositionMenus: (tmenu: AlloyComponent) => void;
}

export interface TieredMenuExtras {
  tieredData: (primary: string, menus: TieredMenuRecord, expansions: Record<string, string>) => TieredData;
  singleData: (name: string, menu: PartialMenuSpec) => TieredData;
  collapseItem: (text: string) => ItemDataTuple;
}

export interface TieredMenuSketcher extends SingleSketch<TieredMenuSpec>, TieredMenuApis, TieredMenuExtras { }

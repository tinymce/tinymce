import { Fun, Optional } from '@ephox/katamari';
import { SimRange, SugarElement } from '@ephox/sugar';

import { Bounds } from '../../alien/Boxes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Bubble } from '../layout/Bubble';
import { AnchorBox, AnchorLayout, PlacerResult } from '../layout/LayoutTypes';
import { OriginAdt } from '../layout/Origins';
import { Transition } from '../view/Transitions';

// doPlace(component, origin, anchoring, placeeState, posConfig, placee, lastPlacement, transition);
export type AnchorPlacement = (
  comp: AlloyComponent,
  origin: OriginAdt,
  anchoring: Anchoring,
  getBounds: Optional<() => Bounds>,
  placee: AlloyComponent,
  lastPlacement: Optional<PlacerResult>,
  transition: Optional<Transition>
) => PlacerResult;

export interface CommonAnchorSpec {
  type: string;
}

export type AnchorSpec = SelectionAnchorSpec | HotspotAnchorSpec | SubmenuAnchorSpec | MakeshiftAnchorSpec | NodeAnchorSpec;

export interface AnchorDetail<D> {
  placement: (comp: AlloyComponent, anchor: D, origin: OriginAdt) => Optional<Anchoring>;
}

export type MaxHeightFunction = (elem: SugarElement<HTMLElement>, available: number) => void;
export type MaxWidthFunction = (elem: SugarElement<HTMLElement>, available: number) => void;
export interface AnchorOverrides {
  maxHeightFunction?: MaxHeightFunction;
  maxWidthFunction?: MaxWidthFunction;
}

export interface LayoutsDetail {
  onLtr: (elem: SugarElement<Element>) => AnchorLayout[];
  onRtl: (elem: SugarElement<Element>) => AnchorLayout[];
  onBottomLtr: Optional<(elem: SugarElement<Element>) => AnchorLayout[]>;
  onBottomRtl: Optional<(elem: SugarElement<Element>) => AnchorLayout[]>;
}

export interface HasLayoutAnchor {
  layouts: Optional<LayoutsDetail>;
}

export interface Layouts {
  onLtr: (elem: SugarElement<Element>) => AnchorLayout[];
  onRtl: (elem: SugarElement<Element>) => AnchorLayout[];
  onBottomLtr?: (elem: SugarElement<Element>) => AnchorLayout[];
  onBottomRtl?: (elem: SugarElement<Element>) => AnchorLayout[];
}

export interface HasLayoutAnchorSpec {
  layouts?: Layouts;
}

export interface SelectionTableCellRange {
  firstCell: SugarElement<HTMLTableCellElement>;
  lastCell: SugarElement<HTMLTableCellElement>;
}

export interface SelectionAnchorSpec extends CommonAnchorSpec, HasLayoutAnchorSpec {
  type: 'selection';
  getSelection?: () => Optional<SimRange | SelectionTableCellRange>;
  root: SugarElement<Node>;
  bubble?: Bubble;
  overrides?: AnchorOverrides;
  showAbove?: boolean;
}

export interface SelectionAnchor extends AnchorDetail<SelectionAnchor>, HasLayoutAnchor {
  getSelection: Optional<() => Optional<SimRange | SelectionTableCellRange>>;
  root: SugarElement<Node>;
  bubble: Optional<Bubble>;
  overrides: AnchorOverrides;
  showAbove: boolean;
}

export interface NodeAnchorSpec extends CommonAnchorSpec, HasLayoutAnchorSpec {
  type: 'node';
  node: Optional<SugarElement<Element>>;
  root: SugarElement<Node>;
  bubble?: Bubble;
  overrides?: AnchorOverrides;
  showAbove?: boolean;
}

export interface NodeAnchor extends AnchorDetail<NodeAnchor>, HasLayoutAnchor {
  node: Optional<SugarElement<Element>>;
  root: SugarElement<Node>;
  bubble: Optional<Bubble>;
  overrides: AnchorOverrides;
  showAbove: boolean;
}

export interface HotspotAnchorSpec extends CommonAnchorSpec, HasLayoutAnchorSpec {
  type: 'hotspot';
  hotspot: AlloyComponent;
  bubble?: Bubble;
  overrides?: AnchorOverrides;
}

export interface HotspotAnchor extends AnchorDetail<HotspotAnchor>, HasLayoutAnchor {
  hotspot: AlloyComponent;
  bubble: Optional<Bubble>;
  overrides: AnchorOverrides;
}

export interface SubmenuAnchorSpec extends CommonAnchorSpec, HasLayoutAnchorSpec {
  type: 'submenu';
  overrides?: AnchorOverrides;
  item: AlloyComponent;
}

export interface SubmenuAnchor extends AnchorDetail<SubmenuAnchor>, HasLayoutAnchor {
  item: AlloyComponent;
  overrides: AnchorOverrides;
}

export interface MakeshiftAnchorSpec extends CommonAnchorSpec, HasLayoutAnchorSpec {
  type: 'makeshift';
  x: number;
  y: number;
  height?: number;
  width?: number;
  bubble?: Bubble;
  overrides?: AnchorOverrides;
}

export interface MakeshiftAnchor extends AnchorDetail<MakeshiftAnchor>, HasLayoutAnchor {
  x: number;
  y: number;
  height: number;
  width: number;
  bubble: Bubble;
  overrides: AnchorOverrides;
}

export interface Anchoring {
  anchorBox: AnchorBox;
  bubble: Bubble;
  overrides: AnchorOverrides;
  layouts: AnchorLayout[];
}

const nu: (spec: Anchoring) => Anchoring = Fun.identity;

export {
  nu
};

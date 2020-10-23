import { Optional } from '@ephox/katamari';
import { SimRange, SugarElement } from '@ephox/sugar';

import { Bounds } from '../../alien/Boxes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Bubble } from '../layout/Bubble';
import { AnchorBox, AnchorLayout } from '../layout/LayoutTypes';
import { OriginAdt } from '../layout/Origins';

// doPlace(component, origin, anchoring, posConfig, placee);
export type AnchorPlacement =
  (comp: AlloyComponent, origin: OriginAdt, anchoring: Anchoring, getBounds: Optional<() => Bounds>, placee: AlloyComponent) => void;

export interface CommonAnchorSpec {
  anchor: string;
}

export type AnchorSpec = SelectionAnchorSpec | HotspotAnchorSpec | SubmenuAnchorSpec | MakeshiftAnchorSpec | NodeAnchorSpec;

export interface AnchorDetail<D> {
  placement: (comp: AlloyComponent, anchor: D, origin: OriginAdt) => Optional<Anchoring>;
}

export type MaxHeightFunction = (elem: SugarElement, available: number) => void;
export type MaxWidthFunction = (elem: SugarElement, available: number) => void;
export interface AnchorOverrides {
  maxHeightFunction?: MaxHeightFunction;
  maxWidthFunction?: MaxWidthFunction;
}

export interface LayoutsDetail {
  onLtr: (elem: SugarElement) => AnchorLayout[];
  onRtl: (elem: SugarElement) => AnchorLayout[];
  onBottomLtr: Optional<(elem: SugarElement) => AnchorLayout[]>;
  onBottomRtl: Optional<(elem: SugarElement) => AnchorLayout[]>;
}

export interface HasLayoutAnchor {
  layouts: Optional<LayoutsDetail>;
}

export interface Layouts {
  onLtr: (elem: SugarElement) => AnchorLayout[];
  onRtl: (elem: SugarElement) => AnchorLayout[];
  onBottomLtr?: (elem: SugarElement) => AnchorLayout[];
  onBottomRtl?: (elem: SugarElement) => AnchorLayout[];
}

export interface HasLayoutAnchorSpec {
  layouts?: Layouts;
}

export interface SelectionAnchorSpec extends CommonAnchorSpec, HasLayoutAnchorSpec {
  anchor: 'selection';
  getSelection?: () => Optional<SimRange>;
  root: SugarElement;
  bubble?: Bubble;
  overrides?: AnchorOverrides;
  showAbove?: boolean;
}

export interface SelectionAnchor extends AnchorDetail<SelectionAnchor>, HasLayoutAnchor {
  getSelection: Optional<() => Optional<SimRange>>;
  root: SugarElement;
  bubble: Optional<Bubble>;
  overrides: AnchorOverrides;
  showAbove: boolean;
}

export interface NodeAnchorSpec extends CommonAnchorSpec, HasLayoutAnchorSpec {
  anchor: 'node';
  node: Optional<SugarElement>;
  root: SugarElement;
  bubble?: Bubble;
  overrides?: AnchorOverrides;
  showAbove?: boolean;
}

export interface NodeAnchor extends AnchorDetail<NodeAnchor>, HasLayoutAnchor {
  node: Optional<SugarElement>;
  root: SugarElement;
  bubble: Optional<Bubble>;
  overrides: AnchorOverrides;
  showAbove: boolean;
}

export interface HotspotAnchorSpec extends CommonAnchorSpec, HasLayoutAnchorSpec {
  anchor: 'hotspot';
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
  anchor: 'submenu';
  overrides?: AnchorOverrides;
  item: AlloyComponent;
}

export interface SubmenuAnchor extends AnchorDetail<SubmenuAnchor>, HasLayoutAnchor {
  item: AlloyComponent;
  overrides: AnchorOverrides;
}

export interface MakeshiftAnchorSpec extends CommonAnchorSpec {
  anchor: 'makeshift';
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
  placer: Optional<AnchorPlacement>;
}

const nu: (spec: Anchoring) => Anchoring = (x) => x;

export {
  nu
};

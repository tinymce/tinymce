import { Option } from '@ephox/katamari';
import { Element, SimRange } from '@ephox/sugar';

import { Bounds } from '../../alien/Boxes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Bubble } from '../layout/Bubble';
import { AnchorBox, AnchorLayout } from '../layout/LayoutTypes';
import { OriginAdt } from '../layout/Origins';

// doPlace(component, origin, anchoring, posConfig, placee);
export type AnchorPlacement =
  (comp: AlloyComponent, origin: OriginAdt, anchoring: Anchoring, getBounds: Option<() => Bounds>, placee: AlloyComponent) => void;

export interface CommonAnchorSpec {
  anchor: string;
}

export type AnchorSpec = SelectionAnchorSpec | HotspotAnchorSpec | SubmenuAnchorSpec | MakeshiftAnchorSpec | NodeAnchorSpec;

export interface AnchorDetail<D> {
  placement: (comp: AlloyComponent, anchor: D, origin: OriginAdt) => Option<Anchoring>;
}

export type MaxHeightFunction = (elem: Element, available: number) => void;
export type MaxWidthFunction = (elem: Element, available: number) => void;
export interface AnchorOverrides {
  maxHeightFunction?: MaxHeightFunction;
  maxWidthFunction?: MaxWidthFunction;
}

export interface LayoutsDetail {
  onLtr: (elem: Element) => AnchorLayout[];
  onRtl: (elem: Element) => AnchorLayout[];
  onBottomLtr: Option<(elem: Element) => AnchorLayout[]>;
  onBottomRtl: Option<(elem: Element) => AnchorLayout[]>;
}

export interface HasLayoutAnchor {
  layouts: Option<LayoutsDetail>;
}

export interface Layouts {
  onLtr: (elem: Element) => AnchorLayout[];
  onRtl: (elem: Element) => AnchorLayout[];
  onBottomLtr?: (elem: Element) => AnchorLayout[];
  onBottomRtl?: (elem: Element) => AnchorLayout[];
}

export interface HasLayoutAnchorSpec {
  layouts?: Layouts;
}

export interface SelectionAnchorSpec extends CommonAnchorSpec, HasLayoutAnchorSpec {
  anchor: 'selection';
  getSelection?: () => Option<SimRange>;
  root: Element;
  bubble?: Bubble;
  overrides?: AnchorOverrides;
  showAbove?: boolean;
}

export interface SelectionAnchor extends AnchorDetail<SelectionAnchor>, HasLayoutAnchor {
  getSelection: Option<() => Option<SimRange>>;
  root: Element;
  bubble: Option<Bubble>;
  overrides: AnchorOverrides;
  showAbove: boolean;
}

export interface NodeAnchorSpec extends CommonAnchorSpec, HasLayoutAnchorSpec {
  anchor: 'node';
  node: Option<Element>;
  root: Element;
  bubble?: Bubble;
  overrides?: AnchorOverrides;
  showAbove?: boolean;
}

export interface NodeAnchor extends AnchorDetail<NodeAnchor>, HasLayoutAnchor {
  node: Option<Element>;
  root: Element;
  bubble: Option<Bubble>;
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
  bubble: Option<Bubble>;
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
  placer: Option<AnchorPlacement>;
}

const nu: (spec: Anchoring) => Anchoring = (x) => x;

export {
  nu
};

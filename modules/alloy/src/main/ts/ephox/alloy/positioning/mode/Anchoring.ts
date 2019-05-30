import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import { SugarRange } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { OriginAdt } from '../../behaviour/positioning/PositionApis';
import { Bubble } from '../../positioning/layout/Bubble';
import { AnchorBox, AnchorLayout } from '../../positioning/layout/LayoutTypes';
import { Bounds } from '../../alien/Boxes';

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

export type MaxHeightFunction =  (elem: Element, available: number) => void;
export interface AnchorOverrides {
  maxHeightFunction?: MaxHeightFunction;
}

export interface HasLayoutAnchor {
  layouts: Option<{
    onLtr: (elem: Element) => AnchorLayout[];
    onRtl: (elem: Element) => AnchorLayout[];
  }>;
}

export interface HasLayoutAnchorSpec {
  layouts?: {
    onLtr: (elem: Element) => AnchorLayout[];
    onRtl: (elem: Element) => AnchorLayout[];
  };
}

export interface SelectionAnchorSpec extends CommonAnchorSpec, HasLayoutAnchorSpec {
  anchor: 'selection';
  getSelection?: () => Option<SugarRange>;
  root: Element;
  bubble?: Bubble;
  overrides?: AnchorOverrides;
  showAbove?: boolean;
}

export interface SelectionAnchor extends AnchorDetail<SelectionAnchor>, HasLayoutAnchor {
  getSelection: Option<() => Option<SugarRange>>;
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
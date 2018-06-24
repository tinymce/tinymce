import { Contracts, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import { SugarRange } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { OriginAdt } from '../../behaviour/positioning/PositionApis';
import { PositioningConfig } from '../../behaviour/positioning/PositioningTypes';
import { Bubble } from '../../positioning/layout/Bubble';
import { AnchorBox, AnchorLayout } from '../../positioning/layout/Layout';

// doPlace(component, origin, anchoring, posConfig, placee);
export type AnchorPlacement =
  (comp: AlloyComponent, origin: OriginAdt, anchoring: Anchoring, posConfig: PositioningConfig, placee: AlloyComponent) => void;

export interface CommonAnchorSpec {
  anchor: string;
}

export type AnchorSpec = SelectionAnchorSpec | HotspotAnchorSpec | SubmenuAnchorSpec | MakeshiftAnchorSpec;

export interface AnchorDetail<D> {
  placement: () => (comp: AlloyComponent, posInfo: PositioningConfig, anchor: D, origin: OriginAdt) => Option<Anchoring>;
}

export type MaxHeightFunction =  (elem: Element, available: number) => void;
export interface AnchorOverrides {
  maxHeightFunction?: MaxHeightFunction;
}

export interface SelectionAnchorSpec extends CommonAnchorSpec {
  anchor: 'selection';
  getSelection?: () => Option<SugarRange>;
  root: Element;
  bubble?: Bubble;
  overrides?: AnchorOverrides;
  showAbove?: boolean;
}

export interface SelectionAnchor extends AnchorDetail<SelectionAnchor> {
  getSelection: () => Option<() => Option<SugarRange>>;
  root: () => Element;
  bubble: () => Option<Bubble>;
  overrides: () => AnchorOverrides;
  showAbove: () => boolean;
}

export interface HotspotAnchorSpec extends CommonAnchorSpec {
  anchor: 'hotspot';
  hotspot: AlloyComponent;
  layouts?: {
    onLtr: (elem: Element) => AnchorLayout[];
    onRtl: (elem: Element) => AnchorLayout[];
  };
}

export interface HotspotAnchor extends AnchorDetail<HotspotAnchor> {
  hotspot: () => AlloyComponent;
  layouts: () => {
    onLtr: () => (elem: Element) => AnchorLayout[];
    onRtl: () => (elem: Element) => AnchorLayout[];
  };
}

export interface SubmenuAnchorSpec extends CommonAnchorSpec {
  anchor: 'submenu';
  item: AlloyComponent;
  layouts?: {
    onLtr: (elem: Element) => AnchorLayout[];
    onRtl: (elem: Element) => AnchorLayout[];
  };
}

export interface SubmenuAnchor extends AnchorDetail<SubmenuAnchor> {
  item: () => AlloyComponent;
  layouts: () => {
    onLtr: () => (elem: Element) => AnchorLayout[];
    onRtl: () => (elem: Element) => AnchorLayout[];
  };
}

export interface MakeshiftAnchorSpec extends CommonAnchorSpec {
  anchor: 'makeshift';
  x: number;
  y: number;
  height?: number;
  width?: number;
  bubble?: Bubble;
  layouts?: {
    onLtr: (elem: Element) => AnchorLayout[];
    onRtl: (elem: Element) => AnchorLayout[];
  };
}

export interface MakeshiftAnchor extends AnchorDetail<MakeshiftAnchor> {
  x: () => number;
  y: () => number;
  height?: () => number;
  width?: () => number;
  bubble?: () => Bubble;
  layouts?: () => Option<{
    onLtr: () => (elem: Element) => AnchorLayout[];
    onRtl: () => (elem: Element) => AnchorLayout[];
  }>;
}

export interface Anchoring {
  anchorBox: () => AnchorBox;
  bubble: () => Bubble;
  overrides: () => AnchorOverrides;
  layouts: () => AnchorLayout[];
  placer: () => Option<AnchorPlacement>;
}

const nu: (spec) => Anchoring = Contracts.exactly([
  'anchorBox',
  'bubble',
  'overrides',
  'layouts',
  'placer'
]);

export {
  nu
};
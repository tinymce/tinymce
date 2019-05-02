import { Future, Option, Result } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { AnchorSpec, AnchorOverrides } from '../../positioning/mode/Anchoring';
import { TieredData, TieredMenuSpec } from '../../ui/types/TieredMenuTypes';
import { Element } from '@ephox/sugar';
import { AnchorLayout } from '../../positioning/layout/LayoutTypes';
import { LazySink } from '../../api/component/CommonTypes';

// F is the fetched data
export interface CommonDropdownDetail<F> extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];

  role: Option<string>;
  eventOrder: Record<string, string[]>;
  fetch: (comp: AlloyComponent) => Future<Option<F>>;
  onOpen: (anchor: AnchorSpec, comp: AlloyComponent, menu: AlloyComponent) => void;

  lazySink: Option<LazySink>;
  // TODO test getHotspot and overrides
  getHotspot: (comp: AlloyComponent) => Option<AlloyComponent>;
  getAnchorOverrides: () => AnchorOverrides;
  layouts: Option<{
    onLtr: (elem: Element) => AnchorLayout[];
    onRtl: (elem: Element) => AnchorLayout[];
  }>;
  matchWidth: boolean;
  useMinWidth: boolean;
  sandboxClasses: string[];
  sandboxBehaviours: SketchBehaviours;
}

export interface DropdownDetail extends CommonDropdownDetail<TieredData>, CompositeSketchDetail {
  dropdownBehaviours: SketchBehaviours;
  onExecute: (sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;
  toggleClass: string;
}

export interface DropdownApis {
  open: (comp: AlloyComponent) => void;
  expand: (comp: AlloyComponent) => void;
  isOpen: (comp: AlloyComponent) => boolean;
  close: (comp: AlloyComponent) => void;
}

export interface DropdownSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  fetch: (comp: AlloyComponent) => Future<Option<TieredData>>;
  onOpen?: (anchor: AnchorSpec, comp: AlloyComponent, menu: AlloyComponent) => void;
  dropdownBehaviours?: AlloyBehaviourRecord;
  onExecute?: (sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;
  eventOrder?: Record<string, string[]>;
  sandboxClasses?: string[];
  sandboxBehaviours?: AlloyBehaviourRecord;
  getHotspot?: (comp: AlloyComponent) => Option<AlloyComponent>;
  getAnchorOverrides?: () => () => AnchorOverrides;
  layouts?: Option<{
    onLtr: (elem: Element) => AnchorLayout[];
    onRtl: (elem: Element) => AnchorLayout[];
  }>;

  toggleClass: string;
  lazySink?: LazySink;
  parts: {
    menu: Partial<TieredMenuSpec>;
  };
  matchWidth?: boolean;
  useMinWidth?: boolean;
  role?: string;

}

export interface DropdownSketcher extends CompositeSketch<DropdownSpec, DropdownDetail>, DropdownApis { }
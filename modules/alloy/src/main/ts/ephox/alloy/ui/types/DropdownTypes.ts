import { Future, Optional } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { LazySink } from '../../api/component/CommonTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { AnchorOverrides, AnchorSpec, HasLayoutAnchor, HasLayoutAnchorSpec } from '../../positioning/mode/Anchoring';
import { TieredData, TieredMenuSpec } from './TieredMenuTypes';

// F is the fetched data
export interface CommonDropdownDetail<F> extends CompositeSketchDetail, HasLayoutAnchor {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];

  role: Optional<string>;
  eventOrder: Record<string, string[]>;
  fetch: (comp: AlloyComponent) => Future<Optional<F>>;
  onOpen: (anchor: AnchorSpec, comp: AlloyComponent, menu: AlloyComponent) => void;

  lazySink: Optional<LazySink>;
  // TODO test getHotspot and overrides
  getHotspot: (comp: AlloyComponent) => Optional<AlloyComponent>;
  getAnchorOverrides: () => AnchorOverrides;
  matchWidth: boolean;
  useMinWidth: boolean;
  sandboxClasses: string[];
  sandboxBehaviours: SketchBehaviours;
}

export interface DropdownDetail extends CommonDropdownDetail<TieredData>, CompositeSketchDetail {
  dom: RawDomSchema;
  dropdownBehaviours: SketchBehaviours;
  onExecute: (sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;
  toggleClass: string;
}

export interface DropdownApis {
  open: (comp: AlloyComponent) => void;
  refetch: (comp: AlloyComponent) => Future<void>;
  expand: (comp: AlloyComponent) => void;
  isOpen: (comp: AlloyComponent) => boolean;
  close: (comp: AlloyComponent) => void;
  repositionMenus: (comp: AlloyComponent) => void;
}

export interface DropdownSpec extends CompositeSketchSpec, HasLayoutAnchorSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  fetch: (comp: AlloyComponent) => Future<Optional<TieredData>>;
  onOpen?: (anchor: AnchorSpec, comp: AlloyComponent, menu: AlloyComponent) => void;
  dropdownBehaviours?: AlloyBehaviourRecord;
  onExecute?: (sandbox: AlloyComponent, item: AlloyComponent, value: any) => void;
  eventOrder?: Record<string, string[]>;
  sandboxClasses?: string[];
  sandboxBehaviours?: AlloyBehaviourRecord;
  getHotspot?: (comp: AlloyComponent) => Optional<AlloyComponent>;
  getAnchorOverrides?: () => AnchorOverrides;

  toggleClass: string;
  lazySink?: LazySink;
  parts: {
    menu: Partial<TieredMenuSpec>;
  };
  matchWidth?: boolean;
  useMinWidth?: boolean;
  role?: string;

}

export interface DropdownSketcher extends CompositeSketch<DropdownSpec>, DropdownApis { }

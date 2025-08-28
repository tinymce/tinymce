import type { Future, Optional, Result } from '@ephox/katamari';

import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import type { CompositeSketch, CompositeSketchSpec } from '../../api/ui/Sketcher';
import type { AnchorOverrides, AnchorSpec, HasLayoutAnchorSpec } from '../../positioning/mode/Anchoring';

import type { CommonDropdownDetail } from './DropdownTypes';
import type { TieredData, TieredMenuSpec } from './TieredMenuTypes';

export interface SplitDropdownDetail extends CommonDropdownDetail<TieredData> {
  splitDropdownBehaviours: SketchBehaviours;
  toggleClass: string;

  onExecute: (comp: AlloyComponent, button: AlloyComponent) => void;
  onItemExecute: (comp: AlloyComponent, button: AlloyComponent, item: AlloyComponent) => void;
}

export interface SplitDropdownApis {
  repositionMenus: (comp: AlloyComponent) => void;
}

export interface SplitDropdownSpec extends CompositeSketchSpec, HasLayoutAnchorSpec {
  uid?: string;
  dom: RawDomSchema;
  role?: string;
  components?: AlloySpec[];
  splitDropdownBehaviours?: AlloyBehaviourRecord;
  eventOrder?: Record<string, string[]>;
  sandboxClasses?: string[];
  sandboxBehaviours?: AlloyBehaviourRecord;
  getHotspot?: (comp: AlloyComponent) => Optional<AlloyComponent>;
  getAnchorOverrides?: () => AnchorOverrides;

  onExecute: (comp: AlloyComponent, button: AlloyComponent) => void;
  onItemExecute: (comp: AlloyComponent, button: AlloyComponent, item: AlloyComponent) => void;

  onOpen?: (anchor: AnchorSpec, comp: AlloyComponent, menu: AlloyComponent) => void;

  lazySink?: (comp: AlloyComponent) => Result<AlloyComponent, Error>;
  fetch: (comp: AlloyComponent) => Future<Optional<TieredData>>;
  toggleClass: string;
  matchWidth?: boolean;
  useMinWidth?: boolean;

  parts: {
    menu: Partial<TieredMenuSpec>;
  };
}

export interface SplitDropdownSketcher extends CompositeSketch<SplitDropdownSpec>, SplitDropdownApis { }

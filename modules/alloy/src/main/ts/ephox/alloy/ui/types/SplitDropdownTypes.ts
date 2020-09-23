import { Future, Optional, Result } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { AnchorOverrides, AnchorSpec, HasLayoutAnchorSpec } from '../../positioning/mode/Anchoring';
import { CommonDropdownDetail } from './DropdownTypes';
import { TieredData, TieredMenuSpec } from './TieredMenuTypes';

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

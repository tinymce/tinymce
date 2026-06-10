import type { Future, Optional } from '@ephox/katamari';

import type { Bounds } from '../../alien/Boxes';
import type { LazySink } from '../../api/component/CommonTypes';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { AlloySpec, SimpleOrSketchSpec } from '../../api/component/SpecTypes';
import type { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import type { HasLayoutAnchor, HasLayoutAnchorSpec } from '../../positioning/mode/Anchoring';

import type { ToolbarSpec } from './ToolbarTypes';

export interface FloatingToolbarButtonDetail extends CompositeSketchDetail, HasLayoutAnchor {
  lazySink: LazySink;
  fetch: () => Future<AlloySpec[]>;
  getBounds: Optional<() => Bounds>;
  fireDismissalEventInstead: Optional<{
    event: string;
  }>;

  markers: {
    toggledClass: string;
  };

  onToggled: (comp: AlloyComponent, state: boolean) => void;
}

export interface FloatingToolbarButtonApis {
  setGroups: (floatingToolbarButton: AlloyComponent, groups: AlloySpec[]) => Optional<AlloyComponent>;
  reposition: (floatingToolbarButton: AlloyComponent) => void;
  toggle: (floatingToolbarButton: AlloyComponent) => void;
  toggleWithoutFocusing: (floatingToolbarButton: AlloyComponent) => void;
  getToolbar: (floatingToolbarButton: AlloyComponent) => Optional<AlloyComponent>;
  isOpen: (floatingToolbarButton: AlloyComponent) => boolean;
}

export interface FloatingToolbarButtonSpec extends CompositeSketchSpec, HasLayoutAnchorSpec {
  lazySink: LazySink;
  fetch: () => Future<AlloySpec[]>;
  getBounds?: () => Bounds;
  fireDismissalEventInstead?: {
    event?: string;
  };

  markers: {
    toggledClass: string;
  };

  parts: {
    button: Partial<SimpleOrSketchSpec>;
    toolbar: Partial<ToolbarSpec>;
  };

  onToggled?: (comp: AlloyComponent, state: boolean) => void;
}

export interface FloatingToolbarButtonSketcher extends CompositeSketch<FloatingToolbarButtonSpec>, FloatingToolbarButtonApis { }

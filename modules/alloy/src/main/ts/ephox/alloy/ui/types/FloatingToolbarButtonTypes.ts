import { LazySink } from '../../api/component/CommonTypes';
import { SimpleOrSketchSpec, AlloySpec } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { ToolbarSpec } from './ToolbarTypes';
import { HasLayoutAnchor, HasLayoutAnchorSpec } from '../../positioning/mode/Anchoring';
import { Future, Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Bounds } from '../../alien/Boxes';

export interface FloatingToolbarButtonDetail extends CompositeSketchDetail, HasLayoutAnchor {
  lazySink: LazySink;
  fetch: () => Future<AlloySpec[]>;
  getBounds: Option<() => Bounds>;
  fireDismissalEventInstead: Option<{
    event: string;
  }>;

  markers: {
    toggledClass: string;
  };
}

export interface FloatingToolbarButtonApis {
  setGroups: (floatingToolbarButton: AlloyComponent, groups: AlloySpec[]) => Option<AlloyComponent>;
  reposition: (floatingToolbarButton: AlloyComponent) => void;
  toggle: (floatingToolbarButton: AlloyComponent) => void;
  getToolbar: (floatingToolbarButton: AlloyComponent) => Option<AlloyComponent>;
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
    'button': Partial<SimpleOrSketchSpec>;
    'toolbar': Partial<ToolbarSpec>;
  };
}

export interface FloatingToolbarButtonSketcher extends CompositeSketch<FloatingToolbarButtonSpec>, FloatingToolbarButtonApis { }

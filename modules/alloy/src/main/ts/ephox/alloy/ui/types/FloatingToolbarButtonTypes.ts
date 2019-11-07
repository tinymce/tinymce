import { LazySink } from '../../api/component/CommonTypes';
import { SimpleOrSketchSpec, AlloySpec } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { ToolbarSpec } from './ToolbarTypes';
import { HasLayoutAnchor, HasLayoutAnchorSpec } from '../../positioning/mode/Anchoring';
import { Future } from '@ephox/katamari';

export interface FloatingToolbarButtonDetail extends CompositeSketchDetail, HasLayoutAnchor {
  lazySink: LazySink;
  fetch: () => Future<AlloySpec[]>;

  markers: {
    toggledClass: string;
  };
}

export interface FloatingToolbarButtonSpec extends CompositeSketchSpec, HasLayoutAnchorSpec {
  lazySink: LazySink;
  fetch: () => Future<AlloySpec[]>;

  markers: {
    toggledClass: string;
  };

  parts: {
    'button': Partial<SimpleOrSketchSpec>
    'toolbar': Partial<ToolbarSpec>
  };
}

export interface FloatingToolbarButtonSketcher extends CompositeSketch<FloatingToolbarButtonSpec, FloatingToolbarButtonDetail> { }
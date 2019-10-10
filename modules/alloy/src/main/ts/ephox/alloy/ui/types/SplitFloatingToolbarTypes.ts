import { Option } from '@ephox/katamari';

import { Bounds } from '../../alien/Boxes';
import { LazySink } from '../../api/component/CommonTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SimpleOrSketchSpec } from '../../api/component/SpecTypes';
import { AnchorSpec } from '../../positioning/mode/Anchoring';
import { SplitToolbarBaseDetail, SplitToolbarBaseSpec, SplitToolbarBaseSketcher, SplitToolbarBaseApis } from './SplitToolbarBaseTypes';
import { ToolbarGroupSpec } from './ToolbarGroupTypes';
import { ToolbarSpec } from './ToolbarTypes';

export interface SplitFloatingToolbarDetail extends SplitToolbarBaseDetail {
  lazySink: LazySink;
  getAnchor: (toolbar: AlloyComponent) => AnchorSpec;
  getOverflowBounds: Option<() => Bounds>;

  markers: {
    overflowToggledClass: string;
  };
}

export interface SplitFloatingToolbarApis extends SplitToolbarBaseApis {
  reposition: (toolbar: AlloyComponent) => void;
}

export interface SplitFloatingToolbarSpec extends SplitToolbarBaseSpec {
  lazySink: LazySink;
  getAnchor: (toolbar: AlloyComponent) => AnchorSpec;
  getOverflowBounds?: () => Bounds;

  markers: {
    overflowToggledClass: string;
  };

  parts: {
    'overflow-group': Partial<ToolbarGroupSpec>,
    'overflow-button': Partial<SimpleOrSketchSpec>,
    'overflow': Partial<ToolbarSpec>
  };
}

export interface SplitFloatingToolbarSketcher extends SplitToolbarBaseSketcher<SplitFloatingToolbarSpec, SplitFloatingToolbarDetail>, SplitFloatingToolbarApis { }

import { Cell, Optional } from '@ephox/katamari';

import { Bounds } from '../../alien/Boxes';
import { LazySink } from '../../api/component/CommonTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SimpleOrSketchSpec } from '../../api/component/SpecTypes';
import { SplitToolbarBaseApis, SplitToolbarBaseDetail, SplitToolbarBaseSketcher, SplitToolbarBaseSpec } from './SplitToolbarBaseTypes';
import { ToolbarGroupSpec } from './ToolbarGroupTypes';
import { ToolbarSpec } from './ToolbarTypes';

export interface SplitFloatingToolbarDetail extends SplitToolbarBaseDetail {
  lazySink: LazySink;
  getOverflowBounds: Optional<() => Bounds>;

  markers: {
    overflowToggledClass: string;
  };

  overflowGroups: Cell<AlloyComponent[]>;

  onOpened: (comp: AlloyComponent) => void;
  onClosed: (comp: AlloyComponent) => void;
}

export interface SplitFloatingToolbarApis extends SplitToolbarBaseApis {
  reposition: (toolbar: AlloyComponent) => void;
  getOverflow: (toolbar: AlloyComponent) => Optional<AlloyComponent>;
}

export interface SplitFloatingToolbarSpec extends SplitToolbarBaseSpec {
  lazySink: LazySink;
  getOverflowBounds?: () => Bounds;

  markers: {
    overflowToggledClass: string;
  };

  parts: {
    'overflow-group': Partial<ToolbarGroupSpec>;
    'overflow-button': Partial<SimpleOrSketchSpec>;
    'overflow': Partial<ToolbarSpec>;
  };

  onOpened?: (comp: AlloyComponent) => void;
  onClosed?: (comp: AlloyComponent) => void;
}

export interface SplitFloatingToolbarSketcher extends SplitToolbarBaseSketcher<SplitFloatingToolbarSpec>, SplitFloatingToolbarApis { }

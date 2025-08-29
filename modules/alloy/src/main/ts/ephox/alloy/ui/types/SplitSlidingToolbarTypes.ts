import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { SimpleOrSketchSpec } from '../../api/component/SpecTypes';

import type { SplitToolbarBaseApis, SplitToolbarBaseDetail, SplitToolbarBaseSketcher, SplitToolbarBaseSpec } from './SplitToolbarBaseTypes';
import type { ToolbarGroupSpec } from './ToolbarGroupTypes';

export interface SplitSlidingToolbarDetail extends SplitToolbarBaseDetail {
  markers: {
    closedClass: string;
    openClass: string;
    shrinkingClass: string;
    growingClass: string;
    overflowToggledClass: string;
  };

  onOpened: (comp: AlloyComponent) => void;
  onClosed: (comp: AlloyComponent) => void;
}

export interface SplitSlidingToolbarSpec extends SplitToolbarBaseSpec {
  markers: {
    closedClass: string;
    openClass: string;
    shrinkingClass: string;
    growingClass: string;
    overflowToggledClass: string;
  };

  onOpened?: (comp: AlloyComponent) => void;
  onClosed?: (comp: AlloyComponent) => void;

  parts: {
    'overflow-group': Partial<ToolbarGroupSpec>;
    'overflow-button': Partial<SimpleOrSketchSpec>;
  };
}

export interface SplitSlidingToolbarApis extends SplitToolbarBaseApis { }

export interface SplitSlidingToolbarSketcher extends SplitToolbarBaseSketcher<SplitSlidingToolbarSpec>, SplitSlidingToolbarApis { }

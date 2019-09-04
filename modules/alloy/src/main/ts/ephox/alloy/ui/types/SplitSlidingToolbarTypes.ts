import { SimpleOrSketchSpec } from '../../api/component/SpecTypes';
import { SplitToolbarBaseDetail, SplitToolbarBaseSpec, SplitToolbarBaseSketcher } from './SplitToolbarBaseTypes';
import { ToolbarGroupSpec } from './ToolbarGroupTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';

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
    'overflow-group': Partial<ToolbarGroupSpec>,
    'overflow-button': Partial<SimpleOrSketchSpec>
  };
}

export interface SplitSlidingToolbarSketcher extends SplitToolbarBaseSketcher<SplitSlidingToolbarSpec, SplitSlidingToolbarDetail> { }

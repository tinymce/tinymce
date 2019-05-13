import { AlloyComponent } from '../../api/component/ComponentApi';
import { SimpleOrSketchSpec } from '../../api/component/SpecTypes';
import { ToolbarGroupSpec } from '../types/ToolbarGroupTypes';
import { ToolbarSpec } from '../types/ToolbarTypes';
import { LazySink } from '../../api/component/CommonTypes';
import { AnchorSpec } from '../../positioning/mode/Anchoring';
import { SplitToolbarBaseDetail, SplitToolbarBaseSpec, SplitToolbarBaseSketcher } from './SplitToolbarBaseTypes';

export interface SplitFloatingToolbarDetail extends SplitToolbarBaseDetail {
  lazySink: LazySink;
  getAnchor: (toolbar: AlloyComponent) => AnchorSpec;

  markers: {
    overflowToggledClass: string;
  };
}

export interface SplitFloatingToolbarSpec extends SplitToolbarBaseSpec {
  lazySink: LazySink;
  getAnchor: (toolbar: AlloyComponent) => AnchorSpec;

  markers: {
    overflowToggledClass: string;
  };

  parts: {
    'overflow-group': Partial<ToolbarGroupSpec>,
    'overflow-button': Partial<SimpleOrSketchSpec>,
    'overflow': Partial<ToolbarSpec>
  };
}

export interface SplitFloatingToolbarSketcher extends SplitToolbarBaseSketcher<SplitFloatingToolbarSpec, SplitFloatingToolbarDetail> { }
import * as ToolbarGroupSchema from '../../ui/schema/ToolbarGroupSchema';
import { ToolbarGroupDetail, ToolbarGroupSketcher, ToolbarGroupSpec } from '../../ui/types/ToolbarGroupTypes';
import { Keying } from '../behaviour/Keying';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<ToolbarGroupDetail, ToolbarGroupSpec> = (detail, components, _spec, _externals) => ({
  uid: detail.uid,
  dom: detail.dom,
  components,

  behaviours: SketchBehaviours.augment(
    detail.tgroupBehaviours,
    [
      Keying.config({
        mode: 'flow',
        selector: detail.markers.itemSelector
      })
    ]
  ),

  domModification: {
    attributes: {
      role: 'toolbar'
    }
  }
});

const ToolbarGroup: ToolbarGroupSketcher = Sketcher.composite({
  name: 'ToolbarGroup',
  configFields: ToolbarGroupSchema.schema(),
  partFields: ToolbarGroupSchema.parts(),
  factory
});

export {
  ToolbarGroup
};

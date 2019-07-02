import * as ToolbarGroupSchema from '../../ui/schema/ToolbarGroupSchema';
import { ToolbarGroupDetail, ToolbarGroupSpec, ToolbarGroupSketcher } from '../../ui/types/ToolbarGroupTypes';
import { Keying } from '../behaviour/Keying';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<ToolbarGroupDetail, ToolbarGroupSpec> = (detail, components, spec, _externals) => {
  return {
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
  };
};

const ToolbarGroup = Sketcher.composite({
  name: 'ToolbarGroup',
  configFields: ToolbarGroupSchema.schema(),
  partFields: ToolbarGroupSchema.parts(),
  factory
}) as ToolbarGroupSketcher;

export {
  ToolbarGroup
};

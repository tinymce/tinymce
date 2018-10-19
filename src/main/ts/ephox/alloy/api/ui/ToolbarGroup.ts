import * as Behaviour from '../behaviour/Behaviour';
import { Keying } from '../behaviour/Keying';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import * as ToolbarGroupSchema from '../../ui/schema/ToolbarGroupSchema';
import { Merger } from '@ephox/katamari';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import { ToolbarGroupDetail, ToolbarGroupSpec, ToolbarGroupSketcher } from '../../ui/types/ToolbarGroupTypes';

const factory: CompositeSketchFactory<ToolbarGroupDetail, ToolbarGroupSpec> = (detail, components, spec, _externals) => {
  return {
    'uid': detail.uid,
    'dom': detail.dom,
    'components': components,

    'behaviours': SketchBehaviours.augment(
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
import * as Behaviour from '../behaviour/Behaviour';
import { Keying } from '../behaviour/Keying';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import * as ToolbarGroupSchema from '../../ui/schema/ToolbarGroupSchema';
import { Merger } from '@ephox/katamari';

const factory = function (detail, components, spec, _externals) {
  return Merger.deepMerge(
    {
      dom: {
        attributes: {
          role: 'toolbar'
        }
      }
    },
    {
      'uid': detail.uid(),
      'dom': detail.dom(),
      'components': components,

      'behaviours': Merger.deepMerge(
        Behaviour.derive([
          Keying.config({
            mode: 'flow',
            selector: '.' + detail.markers().itemClass()
          })
        ]),
        SketchBehaviours.get(detail.tgroupBehaviours())
      ),

      'debug.sketcher': spec['debug.sketcher']
    }
  );
};

export default <any> Sketcher.composite({
  name: 'ToolbarGroup',
  configFields: ToolbarGroupSchema.schema(),
  partFields: ToolbarGroupSchema.parts(),
  factory
});
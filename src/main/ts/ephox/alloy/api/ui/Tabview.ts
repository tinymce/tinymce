import Behaviour from '../behaviour/Behaviour';
import Replacing from '../behaviour/Replacing';
import SketchBehaviours from '../component/SketchBehaviours';
import Sketcher from './Sketcher';
import { Merger } from '@ephox/katamari';

var factory = function (detail, spec) {
  return {
    uid: detail.uid(),
    dom: Merger.deepMerge(
      {
        tag: 'div',
        attributes: {
          role: 'tabpanel'
        }
      },
      detail.dom()
    ),

    behaviours: Merger.deepMerge(
      Behaviour.derive([
        Replacing.config({ })
      ]),
      SketchBehaviours.get(detail.tabviewBehaviours())
    )
  };
};

export default <any> Sketcher.single({
  name: 'Tabview',
  configFields: [
    SketchBehaviours.field('tabviewBehaviours', [ Replacing ])
  ],
  factory: factory
});
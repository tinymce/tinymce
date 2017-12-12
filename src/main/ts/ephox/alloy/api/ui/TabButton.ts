import Behaviour from '../behaviour/Behaviour';
import Focusing from '../behaviour/Focusing';
import Keying from '../behaviour/Keying';
import Representing from '../behaviour/Representing';
import SketchBehaviours from '../component/SketchBehaviours';
import Sketcher from './Sketcher';
import ButtonBase from '../../ui/common/ButtonBase';
import { FieldPresence } from '@ephox/boulder';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Id } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';

var factory = function (detail, spec) {
  var events = ButtonBase.events(detail.action());

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components: detail.components(),
    events: events,
    behaviours: Merger.deepMerge(
      Behaviour.derive([
        Focusing.config({ }),
        Keying.config({
          mode: 'execution',
          useSpace: true,
          useEnter: true
        }),
        Representing.config({
          store: {
            mode: 'memory',
            initialValue: detail.value()
          }
        })
      ]),
      SketchBehaviours.get(detail.tabButtonBehaviours())
    ),

    domModification: detail.domModification()
  };
};

export default <any> Sketcher.single({
  name: 'TabButton',
  configFields: [
    FieldSchema.defaulted('uid', undefined),
    FieldSchema.strict('value'),
    FieldSchema.field('dom', 'dom', FieldPresence.mergeWithThunk(function (spec) {
      return {
        attributes: {
          role: 'tab',
          // NOTE: This is used in TabSection to connect "labelledby"
          id: Id.generate('aria'),
          'aria-selected': 'false'
        }
      };
    }), ValueSchema.anyValue()),
    FieldSchema.option('action'),
    FieldSchema.defaulted('domModification', { }),
    SketchBehaviours.field('tabButtonBehaviours', [ Focusing, Keying, Representing ]),

    FieldSchema.strict('view')
  ],
  factory: factory
});
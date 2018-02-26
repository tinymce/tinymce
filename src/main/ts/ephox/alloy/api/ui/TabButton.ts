import { FieldPresence, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Id, Merger } from '@ephox/katamari';

import ButtonBase from '../../ui/common/ButtonBase';
import Behaviour from '../behaviour/Behaviour';
import Focusing from '../behaviour/Focusing';
import Keying from '../behaviour/Keying';
import Representing from '../behaviour/Representing';
import SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';

const factory = function (detail, spec) {
  const events = ButtonBase.events(detail.action());

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components: detail.components(),
    events,
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
          'role': 'tab',
          // NOTE: This is used in TabSection to connect "labelledby"
          'id': Id.generate('aria'),
          'aria-selected': 'false'
        }
      };
    }), ValueSchema.anyValue()),
    FieldSchema.option('action'),
    FieldSchema.defaulted('domModification', { }),
    SketchBehaviours.field('tabButtonBehaviours', [ Focusing, Keying, Representing ]),

    FieldSchema.strict('view')
  ],
  factory
});
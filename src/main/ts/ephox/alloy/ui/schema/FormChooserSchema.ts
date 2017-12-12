import Behaviour from '../../api/behaviour/Behaviour';
import Composing from '../../api/behaviour/Composing';
import Focusing from '../../api/behaviour/Focusing';
import Highlighting from '../../api/behaviour/Highlighting';
import Keying from '../../api/behaviour/Keying';
import Representing from '../../api/behaviour/Representing';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import Fields from '../../data/Fields';
import PartType from '../../parts/PartType';
import ButtonBase from '../common/ButtonBase';
import { FieldSchema } from '@ephox/boulder';
import { Objects } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var schema = [
  FieldSchema.strict('choices'),
  SketchBehaviours.field('chooserBehaviours', [ Keying, Highlighting, Composing, Representing ]),
  Fields.markers([ 'choiceClass', 'selectedClass' ])
];

var partTypes = [
  PartType.required({
    name: 'legend',
    defaults: function (detail) {
      return {
        dom: {
          tag: 'legend'
        }
      };
    }
  }),

  PartType.group({
    factory: {
      sketch: function (spec) {
        return Objects.exclude(spec, [ 'value' ]);
      }
    },
    name: 'choices',
    unit: 'choice',
    overrides: function (detail, choiceSpec) {
      return {
        dom: {
          // Consider making a domModification, although we probably do not want it overwritten.
          attributes: {
            role: 'radio'
          }
        },
        behaviours: Behaviour.derive([
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: choiceSpec.value
            }
          }),
          Focusing.config({ })
        ]),

        domModification: {
          classes: [ detail.markers().choiceClass() ]
        },
        events: ButtonBase.events(Option.none())
      };
    }
  })
];

export default <any> {
  name: Fun.constant('FormChooser'),
  schema: Fun.constant(schema),
  parts: Fun.constant(partTypes)
};
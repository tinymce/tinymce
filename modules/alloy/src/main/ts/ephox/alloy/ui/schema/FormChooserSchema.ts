import { FieldProcessorAdt, FieldSchema, Objects } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Composing } from '../../api/behaviour/Composing';
import { Focusing } from '../../api/behaviour/Focusing';
import { Highlighting } from '../../api/behaviour/Highlighting';
import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as Fields from '../../data/Fields';
import * as PartType from '../../parts/PartType';
import * as ButtonBase from '../common/ButtonBase';
import { FormChooserDetail } from '../../ui/types/FormChooserTypes';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  FieldSchema.strict('choices'),
  SketchBehaviours.field('chooserBehaviours', [ Keying, Highlighting, Composing, Representing ]),
  Fields.markers([ 'choiceClass', 'selectedClass' ])
]);

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.required({
    name: 'legend',
    defaults (detail) {
      return {
        dom: {
          tag: 'legend'
        }
      };
    }
  }),

  PartType.group({
    factory: {
      sketch (spec) {
        return Objects.exclude(spec, [ 'value' ]);
      }
    },
    name: 'choices',
    unit: 'choice',
    overrides (detail: FormChooserDetail, choiceSpec: { value: string }) {
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
          classes: [ detail.markers.choiceClass ]
        },
        events: ButtonBase.events(Option.none())
      };
    }
  })
]);

const name = Fun.constant('FormChooser');

export {
  name,
  schema,
  parts
};
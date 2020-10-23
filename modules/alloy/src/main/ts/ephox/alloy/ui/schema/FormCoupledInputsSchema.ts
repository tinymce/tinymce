import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as AddEventsBehaviour from '../../api/behaviour/AddEventsBehaviour';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { Composing } from '../../api/behaviour/Composing';
import { Representing } from '../../api/behaviour/Representing';
import { Toggling } from '../../api/behaviour/Toggling';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import { Button } from '../../api/ui/Button';
import { FormField } from '../../api/ui/FormField';
import * as Fields from '../../data/Fields';
import * as AlloyParts from '../../parts/AlloyParts';
import * as PartType from '../../parts/PartType';
import { ButtonSpec } from '../types/ButtonTypes';
import { FormCoupledInputsDetail } from '../types/FormCoupledInputsTypes';
import { FormFieldSpec } from '../types/FormFieldTypes';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  FieldSchema.defaulted('field1Name', 'field1'),
  FieldSchema.defaulted('field2Name', 'field2'),
  Fields.onStrictHandler('onLockedChange'),
  Fields.markers([ 'lockClass' ]),
  FieldSchema.defaulted('locked', false),
  SketchBehaviours.field('coupledFieldBehaviours', [ Composing, Representing ])
]);

const getField = (comp: AlloyComponent, detail: FormCoupledInputsDetail, partName: string) => AlloyParts.getPart(comp, detail, partName).bind(Composing.getCurrent);

const coupledPart = (selfName: string, otherName: string) => PartType.required<FormCoupledInputsDetail, FormFieldSpec>({
  factory: FormField,
  name: selfName,
  overrides(detail) {
    return {
      fieldBehaviours: Behaviour.derive([
        AddEventsBehaviour.config('coupled-input-behaviour', [
          AlloyEvents.run(NativeEvents.input(), (me) => {
            getField(me, detail, otherName).each((other) => {
              AlloyParts.getPart(me, detail, 'lock').each((lock) => {
                // TODO IMPROVEMENT: Allow locker to fire onLockedChange if it is turned on after being off.
                if (Toggling.isOn(lock)) { detail.onLockedChange(me, other, lock); }
              });
            });
          })
        ])
      ])
    };
  }
});

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  coupledPart('field1', 'field2'),
  coupledPart('field2', 'field1'),

  PartType.required<FormCoupledInputsDetail, ButtonSpec>({
    factory: Button,
    schema: [
      FieldSchema.strict('dom')
    ],
    name: 'lock',
    overrides(detail) {
      return {
        buttonBehaviours: Behaviour.derive([
          Toggling.config({
            selected: detail.locked,
            toggleClass: detail.markers.lockClass,
            aria: {
              mode: 'pressed'
            }
          })
        ])
      };
    }
  })
]);

const name = () => 'CoupledInputs';

export {
  name,
  schema,
  parts
};

import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as AddEventsBehaviour from '../../api/behaviour/AddEventsBehaviour';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { Composing } from '../../api/behaviour/Composing';
import { Toggling } from '../../api/behaviour/Toggling';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import NativeEvents from '../../api/events/NativeEvents';
import Button from '../../api/ui/Button';
import FormField from '../../api/ui/FormField';
import * as Fields from '../../data/Fields';
import * as AlloyParts from '../../parts/AlloyParts';
import * as PartType from '../../parts/PartType';

const schema = Fun.constant([
  Fields.onStrictHandler('onLockedChange'),
  Fields.markers([ 'lockClass' ])
]);

const getField = function (comp, detail, partName) {
  return AlloyParts.getPart(comp, detail, partName).bind(Composing.getCurrent);
};

const coupledPart = function (selfName, otherName) {
  return PartType.required({
    factory: FormField,
    name: selfName,
    overrides (detail) {
      return {
        fieldBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('coupled-input-behaviour', [
            AlloyEvents.run(NativeEvents.input(), function (me) {
              getField(me, detail, otherName).each(function (other) {
                AlloyParts.getPart(me, detail, 'lock').each(function (lock) {
                  if (Toggling.isOn(lock)) { detail.onLockedChange()(me, other, lock); }
                });
              });
            })
          ])
        ])
      };
    }
  });
};

const parts = Fun.constant([
  coupledPart('field1', 'field2'),
  coupledPart('field2', 'field1'),

  PartType.required({
    factory: Button,
    schema: [
      FieldSchema.strict('dom')
    ],
    name: 'lock',
    overrides (detail) {
      return {
        buttonBehaviours: Behaviour.derive([
          Toggling.config({
            toggleClass: detail.markers().lockClass(),
            aria: {
              mode: 'pressed'
            }
          })
        ])
      };
    }
  })
]);

const name = Fun.constant('CoupledInputs');

export {
  name,
  schema,
  parts
};
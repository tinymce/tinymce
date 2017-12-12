import AddEventsBehaviour from '../../api/behaviour/AddEventsBehaviour';
import Behaviour from '../../api/behaviour/Behaviour';
import Composing from '../../api/behaviour/Composing';
import Toggling from '../../api/behaviour/Toggling';
import AlloyEvents from '../../api/events/AlloyEvents';
import NativeEvents from '../../api/events/NativeEvents';
import Button from '../../api/ui/Button';
import FormField from '../../api/ui/FormField';
import Fields from '../../data/Fields';
import AlloyParts from '../../parts/AlloyParts';
import PartType from '../../parts/PartType';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var schema = [
  Fields.onStrictHandler('onLockedChange'),
  Fields.markers([ 'lockClass' ])
];

var getField = function (comp, detail, partName) {
  return AlloyParts.getPart(comp, detail, partName).bind(Composing.getCurrent);
};

var coupledPart = function (selfName, otherName) {
  return PartType.required({
    factory: FormField,
    name: selfName,
    overrides: function (detail) {
      return {
        fieldBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('coupled-input-behaviour', [
            AlloyEvents.run(NativeEvents.input(), function (me) {
              getField(me, detail, otherName).each(function (other) {
                AlloyParts.getPart(me, detail, 'lock').each(function (lock) {
                  if (Toggling.isOn(lock)) detail.onLockedChange()(me, other, lock);
                });
              });
            })
          ])
        ])
      };
    }
  });
};

var partTypes = [
  coupledPart('field1', 'field2'),
  coupledPart('field2', 'field1'),

  PartType.required({
    factory: Button,
    schema: [
      FieldSchema.strict('dom')
    ],
    name: 'lock',
    overrides: function (detail) {
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
];

export default <any> {
  name: Fun.constant('CoupledInputs'),
  schema: Fun.constant(schema),
  parts: Fun.constant(partTypes)
};
import { DslType } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { FormField } from '../../api/ui/FormField';
import { Slider } from '../../api/ui/Slider';
import * as PartType from '../../parts/PartType';

const schema = Fun.constant([]);

const parts = Fun.constant([
  PartType.required({
    factory: Slider,
    name: 'hue'
  }),
  PartType.required({
    factory: FormField,
    name: 'red'
  }),
  PartType.required({
    factory: FormField,
    name: 'green'
  }),
  PartType.required({
    factory: FormField,
    name: 'blue'
  }),
  PartType.required({
    factory: FormField,
    name: 'hex'
  })
]);

const name = Fun.constant('ColourPicker');

export {
  name,
  schema,
  parts
};
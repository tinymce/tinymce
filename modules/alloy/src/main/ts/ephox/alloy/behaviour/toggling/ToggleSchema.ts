import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as Fields from '../../data/Fields';
import * as ToggleModes from './ToggleModes';

export default [
  FieldSchema.defaulted('selected', false),
  FieldSchema.option('toggleClass'),
  FieldSchema.defaulted('toggleOnExecute', true),

  FieldSchema.defaultedOf('aria', {
    mode: 'none'
  }, ValueSchema.choose(
    'mode', {
      pressed: ValueSchema.objOf([
        FieldSchema.defaulted('syncWithExpanded', false),
        Fields.output('update', ToggleModes.updatePressed)
      ]),
      checked: ValueSchema.objOf([
        Fields.output('update', ToggleModes.updateChecked)
      ]),
      expanded: ValueSchema.objOf([
        Fields.output('update', ToggleModes.updateExpanded)
      ]),
      selected: ValueSchema.objOf([
        Fields.output('update', ToggleModes.updateSelected)
      ]),
      none: ValueSchema.objOf([
        Fields.output('update', Fun.noop)
      ])
    }
  ))
];
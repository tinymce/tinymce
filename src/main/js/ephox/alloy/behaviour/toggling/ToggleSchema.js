import ToggleModes from './ToggleModes';
import Fields from '../../data/Fields';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';



export default <any> [
  FieldSchema.defaulted('selected', false),
  FieldSchema.strict('toggleClass'),
  FieldSchema.defaulted('toggleOnExecute', true),

  FieldSchema.defaultedOf('aria', {
    mode: 'none'
  }, ValueSchema.choose(
    'mode', {
      'pressed': [
        FieldSchema.defaulted('syncWithExpanded', false),
        Fields.output('update', ToggleModes.updatePressed)
      ],
      'checked': [
        Fields.output('update', ToggleModes.updateChecked)
      ],
      'expanded': [
        Fields.output('update', ToggleModes.updateExpanded)
      ],
      'selected': [
        Fields.output('update', ToggleModes.updateSelected)
      ],
      'none': [
        Fields.output('update', Fun.noop)
      ]
    }
  ))
];
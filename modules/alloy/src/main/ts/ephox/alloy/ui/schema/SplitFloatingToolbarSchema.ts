import { FieldSchema } from '@ephox/boulder';
import { Cell, Fun } from '@ephox/katamari';

import { Toolbar } from '../../api/ui/Toolbar';
import * as Fields from '../../data/Fields';
import * as PartType from '../../parts/PartType';
import * as SplitToolbarBase from '../common/SplitToolbarBase';
import { SplitFloatingToolbarDetail } from '../types/SplitFloatingToolbarTypes';
import { ToolbarSpec } from '../types/ToolbarTypes';
import * as ToolbarSchema from './ToolbarSchema';

const schema = Fun.constant([
  Fields.markers([ 'overflowToggledClass' ]),
  FieldSchema.optionFunction('getOverflowBounds'),
  FieldSchema.required('lazySink'),
  FieldSchema.customField('overflowGroups', () => Cell([ ])),
  Fields.onHandler('onOpened'),
  Fields.onHandler('onClosed')
].concat(
  SplitToolbarBase.schema()
));

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.required<SplitFloatingToolbarDetail, ToolbarSpec>({
    factory: Toolbar,
    schema: ToolbarSchema.schema(),
    name: 'primary'
  }),

  PartType.external<SplitFloatingToolbarDetail>({
    schema: ToolbarSchema.schema(),
    name: 'overflow'
  }),

  PartType.external<SplitFloatingToolbarDetail>({
    name: 'overflow-button'
  }),

  PartType.external<SplitFloatingToolbarDetail>({
    name: 'overflow-group'
  })
]);

const name = Fun.constant('SplitFloatingToolbar');

export { name, schema, parts };

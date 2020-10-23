import { FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import { Composing } from '../../api/behaviour/Composing';
import { Highlighting } from '../../api/behaviour/Highlighting';
import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import { field as SketchBehaviourField } from '../../api/component/SketchBehaviours';
import * as FocusManagers from '../../api/focus/FocusManagers';
import * as Fields from '../../data/Fields';
import { FlatgridConfigSpec, MatrixConfigSpec, MenuConfigSpec } from '../../keying/KeyingModeTypes';
import ItemType from '../../menu/build/ItemType';
import SeparatorType from '../../menu/build/SeparatorType';
import WidgetType from '../../menu/build/WidgetType';
import * as PartType from '../../parts/PartType';
import * as Tagger from '../../registry/Tagger';
import { ItemSpec } from '../types/ItemTypes';
import { MenuDetail, MenuGridMovement, MenuMatrixMovement, MenuNormalMovement } from '../types/MenuTypes';

const itemSchema = ValueSchema.choose(
  'type',
  {
    widget: WidgetType,
    item: ItemType,
    separator: SeparatorType
  }
);

const configureGrid = (detail: MenuDetail, movementInfo: MenuGridMovement): FlatgridConfigSpec => ({
  mode: 'flatgrid',
  selector: '.' + detail.markers.item,
  initSize: {
    numColumns: movementInfo.initSize.numColumns,
    numRows: movementInfo.initSize.numRows
  },
  focusManager: detail.focusManager
});

const configureMatrix = (detail: MenuDetail, movementInfo: MenuMatrixMovement): MatrixConfigSpec => ({
  mode: 'matrix',
  selectors: {
    row: movementInfo.rowSelector,
    cell: '.' + detail.markers.item
  },
  focusManager: detail.focusManager
});

const configureMenu = (detail: MenuDetail, movementInfo: MenuNormalMovement): MenuConfigSpec => ({
  mode: 'menu',
  selector: '.' + detail.markers.item,
  moveOnTab: movementInfo.moveOnTab,
  focusManager: detail.focusManager
});

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.group<MenuDetail, ItemSpec>({
    factory: {
      sketch(spec) {
        const itemInfo = ValueSchema.asRawOrDie('menu.spec item', itemSchema, spec);
        return itemInfo.builder(itemInfo);
      }
    },
    name: 'items',
    unit: 'item',
    defaults(detail, u) {
      // Switch this to a common library
      return u.hasOwnProperty('uid') ? u : {
        ...u,
        uid: Tagger.generate('item')
      };
    },
    overrides(detail, u) {
      return {
        type: u.type,
        ignoreFocus: detail.fakeFocus,
        domModification: {
          classes: [ detail.markers.item ]
        }
      };
    }
  })
]);

const schema: () => FieldProcessorAdt[] = Fun.constant([
  FieldSchema.strict('value'),
  FieldSchema.strict('items'),
  FieldSchema.strict('dom'),
  FieldSchema.strict('components'),
  FieldSchema.defaulted('eventOrder', { }),
  SketchBehaviourField('menuBehaviours', [ Highlighting, Representing, Composing, Keying ]),

  FieldSchema.defaultedOf('movement', {
    mode: 'menu',
    moveOnTab: true
  }, ValueSchema.choose(
    'mode',
    {
      grid: [
        Fields.initSize(),
        Fields.output('config', configureGrid)
      ],
      matrix: [
        Fields.output('config', configureMatrix),
        FieldSchema.strict('rowSelector')
      ],
      menu: [
        FieldSchema.defaulted('moveOnTab', true),
        Fields.output('config', configureMenu)
      ]
    }
  )),

  Fields.itemMarkers(),

  FieldSchema.defaulted('fakeFocus', false),
  FieldSchema.defaulted('focusManager', FocusManagers.dom()),
  Fields.onHandler('onHighlight')
]);

const name = Fun.constant('menu');

export {
  name,
  schema,
  parts
};

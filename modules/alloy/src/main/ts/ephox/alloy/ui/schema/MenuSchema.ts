import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Fun, Obj, Optional } from '@ephox/katamari';

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
import { ItemSpec, WidgetItemSpec } from '../types/ItemTypes';
import { MenuDetail, MenuGridMovement, MenuMatrixMovement, MenuNormalMovement } from '../types/MenuTypes';

const itemSchema = StructureSchema.choose(
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
  previousSelector: movementInfo.previousSelector,
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
      sketch: (spec) => {
        const itemInfo = StructureSchema.asRawOrDie('menu.spec item', itemSchema, spec);
        return itemInfo.builder(itemInfo);
      }
    },
    name: 'items',
    unit: 'item',
    defaults: (detail, u) => {
      // Switch this to a common library
      // The WidgetItemSpec is just because it has uid, and the others don't
      // for some reason. So there is nothing guaranteeing that `u` is a WidgetItemSpec,
      // so we should probably rework this code.
      return Obj.has(u as WidgetItemSpec, 'uid') ? u : {
        ...u,
        uid: Tagger.generate('item')
      };
    },
    overrides: (detail, u) => {
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

const schema = Fun.constant([
  FieldSchema.required('value'),
  FieldSchema.required('items'),
  FieldSchema.required('dom'),
  FieldSchema.required('components'),
  FieldSchema.defaulted('eventOrder', { }),
  SketchBehaviourField('menuBehaviours', [ Highlighting, Representing, Composing, Keying ]),

  FieldSchema.defaultedOf('movement', {
    // When you don't specify movement for a Menu, this is what you get
    // a "menu" type of movement that moves on tab. If you want finer-grained
    // control, like disabling moveOnTab, then you need to specify
    // your entire movement configuration when creating your MenuSpec.
    mode: 'menu',
    moveOnTab: true
  }, StructureSchema.choose(
    'mode',
    {
      grid: [
        Fields.initSize(),
        Fields.output('config', configureGrid)
      ],
      matrix: [
        Fields.output('config', configureMatrix),
        FieldSchema.required('rowSelector'),
        FieldSchema.defaulted('previousSelector', Optional.none),
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
  Fields.onHandler('onHighlight'),
  Fields.onHandler('onDehighlight')
]);

const name = Fun.constant('menu');

export {
  name,
  schema,
  parts
};

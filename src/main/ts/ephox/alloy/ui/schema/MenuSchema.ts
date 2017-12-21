import Composing from '../../api/behaviour/Composing';
import Highlighting from '../../api/behaviour/Highlighting';
import Keying from '../../api/behaviour/Keying';
import Representing from '../../api/behaviour/Representing';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import FocusManagers from '../../api/focus/FocusManagers';
import Fields from '../../data/Fields';
import ItemType from '../../menu/build/ItemType';
import SeparatorType from '../../menu/build/SeparatorType';
import WidgetType from '../../menu/build/WidgetType';
import PartType from '../../parts/PartType';
import Tagger from '../../registry/Tagger';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';

var itemSchema = ValueSchema.choose(
  'type',
  {
    widget: WidgetType,
    item: ItemType,
    separator: SeparatorType
  }
);

var configureGrid = function (detail, movementInfo) {
  return {
    mode: 'flatgrid',
    selector: '.' + detail.markers().item(),
    initSize: {
      numColumns: movementInfo.initSize().numColumns(),
      numRows: movementInfo.initSize().numRows()
    },
    focusManager: detail.focusManager()
  };
};

var configureMenu = function (detail, movementInfo) {
  return {
    mode: 'menu',
    selector: '.' + detail.markers().item(),
    moveOnTab: movementInfo.moveOnTab(),
    focusManager: detail.focusManager()
  };
};

var parts = [
  PartType.group({
    factory: {
      sketch: function (spec) {
        var itemInfo = ValueSchema.asStructOrDie('menu.spec item', itemSchema, spec);
        return itemInfo.builder()(itemInfo);
      }
    },
    name: 'items',
    unit: 'item',
    defaults: function (detail, u) {
      var fallbackUid = Tagger.generate('');
      return Merger.deepMerge(
        {
          uid: fallbackUid
        },
        u
      );
    },
    overrides: function (detail, u) {
      return {
        type: u.type,
        ignoreFocus: detail.fakeFocus(),
        domModification: {
          classes: [ detail.markers().item() ]
        }
      };
    }
  })
];

var schema = [
  FieldSchema.strict('value'),
  FieldSchema.strict('items'),
  FieldSchema.strict('dom'),
  FieldSchema.strict('components'),
  FieldSchema.defaulted('eventOrder', { }),
  SketchBehaviours.field('menuBehaviours', [ Highlighting, Representing, Composing, Keying ]),


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
];

export default <any> {
  name: Fun.constant('Menu'),
  schema: Fun.constant(schema),
  parts: Fun.constant(parts)
};
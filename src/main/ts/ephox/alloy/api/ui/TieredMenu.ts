import Composing from '../behaviour/Composing';
import Highlighting from '../behaviour/Highlighting';
import Keying from '../behaviour/Keying';
import Replacing from '../behaviour/Replacing';
import SketchBehaviours from '../component/SketchBehaviours';
import Sketcher from './Sketcher';
import Fields from '../../data/Fields';
import TieredMenuSpec from '../../ui/single/TieredMenuSpec';
import { FieldSchema } from '@ephox/boulder';
import { Objects } from '@ephox/boulder';
import { Id } from '@ephox/katamari';

var tieredData = function (primary, menus, expansions) {
  return {
    primary: primary,
    menus: menus,
    expansions: expansions
  };
};

var singleData = function (name, menu) {
  return {
    primary: name,
    menus: Objects.wrap(name, menu),
    expansions: { }
  };
};

var collapseItem = function (text) {
  return {
    value: Id.generate(TieredMenuSpec.collapseItem()),
    text: text
  };
};

export default <any> Sketcher.single({
  name: 'TieredMenu',
  configFields: [
    Fields.onStrictKeyboardHandler('onExecute'),
    Fields.onStrictKeyboardHandler('onEscape'),

    Fields.onStrictHandler('onOpenMenu'),
    Fields.onStrictHandler('onOpenSubmenu'),
    Fields.onHandler('onCollapseMenu'),

    FieldSchema.defaulted('openImmediately', true),

    FieldSchema.strictObjOf('data', [
      FieldSchema.strict('primary'),
      FieldSchema.strict('menus'),
      FieldSchema.strict('expansions')
    ]),

    FieldSchema.defaulted('fakeFocus', false),
    Fields.onHandler('onHighlight'),
    Fields.onHandler('onHover'),
    Fields.tieredMenuMarkers(),


    FieldSchema.strict('dom'),

    FieldSchema.defaulted('navigateOnHover', true),
    FieldSchema.defaulted('stayInDom', false),

    SketchBehaviours.field('tmenuBehaviours', [ Keying, Highlighting, Composing, Replacing ]),
    FieldSchema.defaulted('eventOrder', { })
  ],

  apis: {
    collapseMenu: function (apis, tmenu) {
      apis.collapseMenu(tmenu);
    }
  },

  factory: TieredMenuSpec.make,

  extraApis: {
    tieredData: tieredData,
    singleData: singleData,
    collapseItem: collapseItem
  }
});
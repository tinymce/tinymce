import { FieldSchema, Objects } from '@ephox/boulder';
import { Id } from '@ephox/katamari';

import * as Fields from '../../data/Fields';
import * as TieredMenuSpec from '../../ui/single/TieredMenuSpec';
import Composing from '../behaviour/Composing';
import Highlighting from '../behaviour/Highlighting';
import Keying from '../behaviour/Keying';
import Replacing from '../behaviour/Replacing';
import SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';

const tieredData = function (primary, menus, expansions) {
  return {
    primary,
    menus,
    expansions
  };
};

const singleData = function (name, menu) {
  return {
    primary: name,
    menus: Objects.wrap(name, menu),
    expansions: { }
  };
};

const collapseItem = function (text) {
  return {
    value: Id.generate(TieredMenuSpec.collapseItem()),
    text
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
    collapseMenu (apis, tmenu) {
      apis.collapseMenu(tmenu);
    }
  },

  factory: TieredMenuSpec.make,

  extraApis: {
    tieredData,
    singleData,
    collapseItem
  }
});
import { FieldSchema, Objects } from '@ephox/boulder';
import { Id } from '@ephox/katamari';

import * as Fields from '../../data/Fields';
import * as TieredMenuSpec from '../../ui/single/TieredMenuSpec';
import { ItemDataTuple } from '../../ui/types/ItemTypes';
import { MenuSpec } from '../../ui/types/MenuTypes';
import { TieredData, TieredMenuRecord, TieredMenuSketcher } from '../../ui/types/TieredMenuTypes';
import { Composing } from '../behaviour/Composing';
import { Highlighting } from '../behaviour/Highlighting';
import { Keying } from '../behaviour/Keying';
import { Replacing } from '../behaviour/Replacing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { single } from './Sketcher';

const tieredData = (primary: string, menus: TieredMenuRecord, expansions: Record<string, string>): TieredData => {
  return {
    primary,
    menus,
    expansions
  };
};

const singleData = (name: string, menu: MenuSpec): TieredData => {
  return {
    primary: name,
    menus: Objects.wrap(name, menu),
    expansions: { }
  };
};

const collapseItem = (text: string): ItemDataTuple => {
  return {
    value: Id.generate(TieredMenuSpec.collapseItem()),
    meta: {
      text
    }
  };
};

const tieredMenu: TieredMenuSketcher = single({
  name: 'TieredMenu',
  configFields: [
    Fields.onStrictKeyboardHandler('onExecute'),
    Fields.onStrictKeyboardHandler('onEscape'),

    Fields.onStrictHandler('onOpenMenu'),
    Fields.onStrictHandler('onOpenSubmenu'),
    Fields.onHandler('onCollapseMenu'),

    FieldSchema.defaulted('highlightImmediately', true),

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
    },
    highlightPrimary (apis, tmenu) {
      apis.highlightPrimary(tmenu);
    }
  },

  factory: TieredMenuSpec.make,

  extraApis: {
    tieredData,
    singleData,
    collapseItem
  }
});

export {
  tieredMenu,
  TieredData
};

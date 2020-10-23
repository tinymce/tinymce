import { FieldSchema, Objects } from '@ephox/boulder';
import { Id } from '@ephox/katamari';

import * as Fields from '../../data/Fields';
import * as TieredMenuSpec from '../../ui/single/TieredMenuSpec';
import { ItemDataTuple } from '../../ui/types/ItemTypes';
import { PartialMenuSpec, TieredData, TieredMenuApis, TieredMenuDetail, TieredMenuExtras, TieredMenuRecord, TieredMenuSketcher, TieredMenuSpec as TieredMenuSpecType } from '../../ui/types/TieredMenuTypes';
import { Composing } from '../behaviour/Composing';
import { Highlighting } from '../behaviour/Highlighting';
import { Keying } from '../behaviour/Keying';
import { Replacing } from '../behaviour/Replacing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { single } from './Sketcher';

const tieredData = (primary: string, menus: TieredMenuRecord, expansions: Record<string, string>): TieredData => ({
  primary,
  menus,
  expansions
});

const singleData = (name: string, menu: PartialMenuSpec): TieredData => ({
  primary: name,
  menus: Objects.wrap(name, menu),
  expansions: { }
});

const collapseItem = (text: string): ItemDataTuple => ({
  value: Id.generate(TieredMenuSpec.collapseItem()),
  meta: {
    text
  }
});

const tieredMenu: TieredMenuSketcher = single<TieredMenuSpecType, TieredMenuDetail, TieredMenuApis, TieredMenuExtras>({
  name: 'TieredMenu',
  configFields: [
    Fields.onStrictKeyboardHandler('onExecute'),
    Fields.onStrictKeyboardHandler('onEscape'),

    Fields.onStrictHandler('onOpenMenu'),
    Fields.onStrictHandler('onOpenSubmenu'),
    Fields.onHandler('onRepositionMenu'),
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
    collapseMenu: (apis, tmenu) => {
      apis.collapseMenu(tmenu);
    },
    highlightPrimary: (apis, tmenu) => {
      apis.highlightPrimary(tmenu);
    },
    repositionMenus: (apis, tmenu) => {
      apis.repositionMenus(tmenu);
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

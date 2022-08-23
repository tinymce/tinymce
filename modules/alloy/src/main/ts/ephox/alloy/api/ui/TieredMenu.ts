import { FieldSchema, Objects } from '@ephox/boulder';
import { Id } from '@ephox/katamari';

import * as Fields from '../../data/Fields';
import * as TieredMenuSpec from '../../ui/single/TieredMenuSpec';
import { ItemDataTuple } from '../../ui/types/ItemTypes';
import { HighlightOnOpen, PartialMenuSpec, TieredData, TieredMenuApis, TieredMenuDetail, TieredMenuExtras, TieredMenuRecord, TieredMenuSketcher, TieredMenuSpec as TieredMenuSpecType } from '../../ui/types/TieredMenuTypes';
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

    // Ideally, we should validate that this is a valid value, but
    // this is an number-based enum, so it would just be a number.
    FieldSchema.defaulted('highlightOnOpen', HighlightOnOpen.HighlightMenuAndItem),

    FieldSchema.requiredObjOf('data', [
      FieldSchema.required('primary'),
      FieldSchema.required('menus'),
      FieldSchema.required('expansions')
    ]),

    FieldSchema.defaulted('fakeFocus', false),

    Fields.onHandler('onHighlightItem'),
    Fields.onHandler('onDehighlightItem'),
    Fields.onHandler('onHover'),
    Fields.tieredMenuMarkers(),

    FieldSchema.required('dom'),

    FieldSchema.defaulted('navigateOnHover', true),
    FieldSchema.defaulted('stayInDom', false),

    SketchBehaviours.field('tmenuBehaviours', [ Keying, Highlighting, Composing, Replacing ]),
    FieldSchema.defaulted('eventOrder', { })
  ],

  apis: {
    collapseMenu: (apis, tmenu) => {
      apis.collapseMenu(tmenu);
    },

    // This will highlight the primary menu AND an item in the primary menu
    // Do not use just to set the active menu.
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

import { FieldSchema, Objects } from '@ephox/boulder';
import { Id } from '@ephox/katamari';

import * as Fields from '../../data/Fields';
import * as TieredMenuSpec from '../../ui/single/TieredMenuSpec';
import { Composing } from '../behaviour/Composing';
import { Highlighting } from '../behaviour/Highlighting';
import { Keying } from '../behaviour/Keying';
import { Replacing } from '../behaviour/Replacing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { single, SingleSketch } from './Sketcher';
import { RawDomSchema, LooseSpec } from '../component/SpecTypes';
import { TieredMenuSketcher, TieredMenuRecord, TieredData } from '../../ui/types/TieredMenuTypes';
import { MenuSpec } from 'ephox/alloy/ui/types/MenuTypes';
import { ItemDataTuple } from 'ephox/alloy/ui/types/ItemTypes';

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
    text
  };
};

const tieredMenu = single({
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
}) as TieredMenuSketcher;

export {
  tieredMenu,
  TieredData
};
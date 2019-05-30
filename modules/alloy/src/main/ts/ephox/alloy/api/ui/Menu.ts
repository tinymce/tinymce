import * as MenuSchema from '../../ui/schema/MenuSchema';
import { make as makeMenuSpec } from '../../ui/single/MenuSpec';
import * as Sketcher from './Sketcher';
import { MenuSketcher } from '../../ui/types/MenuTypes';

const Menu = Sketcher.composite({
  name: 'Menu',
  configFields: MenuSchema.schema(),
  partFields: MenuSchema.parts(),
  factory: makeMenuSpec
}) as MenuSketcher;

export {
  Menu
};
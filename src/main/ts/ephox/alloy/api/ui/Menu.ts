import * as MenuSchema from '../../ui/schema/MenuSchema';
import * as MenuSpec from '../../ui/single/MenuSpec';
import * as Sketcher from './Sketcher';
import { MenuSketcher } from '../../ui/types/MenuTypes';

const Menu = Sketcher.composite({
  name: 'Menu',
  configFields: MenuSchema.schema(),
  partFields: MenuSchema.parts(),
  factory: MenuSpec.make
}) as MenuSketcher;

export {
  Menu
};
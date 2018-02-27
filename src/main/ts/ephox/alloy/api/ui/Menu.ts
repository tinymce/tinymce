import * as MenuSchema from '../../ui/schema/MenuSchema';
import * as MenuSpec from '../../ui/single/MenuSpec';
import * as Sketcher from './Sketcher';

export default <any> Sketcher.composite({
  name: 'Menu',
  configFields: MenuSchema.schema(),
  partFields: MenuSchema.parts(),
  factory: MenuSpec.make
});
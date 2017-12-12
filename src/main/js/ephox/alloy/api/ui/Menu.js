import Sketcher from './Sketcher';
import MenuSchema from '../../ui/schema/MenuSchema';
import MenuSpec from '../../ui/single/MenuSpec';



export default <any> Sketcher.composite({
  name: 'Menu',
  configFields: MenuSchema.schema(),
  partFields: MenuSchema.parts(),
  factory: MenuSpec.make
});
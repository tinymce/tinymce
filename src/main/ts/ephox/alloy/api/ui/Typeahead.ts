import Sketcher from './Sketcher';
import TypeaheadSpec from '../../ui/composite/TypeaheadSpec';
import TypeaheadSchema from '../../ui/schema/TypeaheadSchema';



export default <any> Sketcher.composite({
  name: 'Typeahead',
  configFields: TypeaheadSchema.schema(),
  partFields: TypeaheadSchema.parts(),
  factory: TypeaheadSpec.make
});
import * as Sketcher from './Sketcher';
import * as TypeaheadSpec from '../../ui/composite/TypeaheadSpec';
import * as TypeaheadSchema from '../../ui/schema/TypeaheadSchema';

const Typeahead = Sketcher.composite({
  name: 'Typeahead',
  configFields: TypeaheadSchema.schema(),
  partFields: TypeaheadSchema.parts(),
  factory: TypeaheadSpec.make
});

export {
  Typeahead
};
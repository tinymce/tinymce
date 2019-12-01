import * as Behaviour from './Behaviour';
import * as HighlightApis from '../../behaviour/highlighting/HighlightApis';
import HighlightSchema from '../../behaviour/highlighting/HighlightSchema';
import { HighlightingBehaviour } from '../../behaviour/highlighting/HighlightingTypes';

const Highlighting: HighlightingBehaviour = Behaviour.create({
  fields: HighlightSchema,
  name: 'highlighting',
  apis: HighlightApis
});

export {
  Highlighting
};

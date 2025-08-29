import * as HighlightApis from '../../behaviour/highlighting/HighlightApis';
import type { HighlightingBehaviour } from '../../behaviour/highlighting/HighlightingTypes';
import HighlightSchema from '../../behaviour/highlighting/HighlightSchema';

import * as Behaviour from './Behaviour';

const Highlighting: HighlightingBehaviour = Behaviour.create({
  fields: HighlightSchema,
  name: 'highlighting',
  apis: HighlightApis
});

export {
  Highlighting
};

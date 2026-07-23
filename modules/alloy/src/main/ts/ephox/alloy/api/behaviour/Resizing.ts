import * as ResizingApis from '../../behaviour/resizing/ResizingApis';
import ResizingSchema from '../../behaviour/resizing/ResizingSchema';
import * as ResizingState from '../../behaviour/resizing/ResizingState';
import type { ResizingBehaviour } from '../../behaviour/resizing/ResizingTypes';

import * as Behaviour from './Behaviour';

const Resizing: ResizingBehaviour = Behaviour.create({
  fields: ResizingSchema,
  name: 'resizing',
  apis: ResizingApis,
  state: ResizingState
});

export {
  Resizing
};

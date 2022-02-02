import { FieldSchema, FieldProcessor } from '@ephox/boulder';

import { Composing } from '../api/behaviour/Composing';
import { Receiving } from '../api/behaviour/Receiving';
import { Representing } from '../api/behaviour/Representing';
import { Sandboxing } from '../api/behaviour/Sandboxing';
import { SketchBehaviours } from '../api/component/SketchBehaviours';

// TODO: Roll this back into Fields at some point
// Unfortunately there appears to be a cyclical dependency or something that's preventing it, but for now this will do as it's home
const sandboxFields = (): FieldProcessor[] => [
  FieldSchema.defaulted('sandboxClasses', [ ]),
  SketchBehaviours.field('sandboxBehaviours', [ Composing, Receiving, Sandboxing, Representing ])
];

export {
  sandboxFields
};

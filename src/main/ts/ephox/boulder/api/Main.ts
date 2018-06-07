import * as FieldPresence from './FieldPresence';
import * as FieldSchema from './FieldSchema';
import * as Objects from './Objects';
import * as ValueSchema from './ValueSchema';
import { foldType, foldField, Processor, FieldProcessorAdt } from './DslType';

const DslType = {
  foldType,
  foldField
};

export {
  DslType,
  FieldPresence,
  FieldSchema,
  Objects,
  ValueSchema,

  // Types
  Processor,
  FieldProcessorAdt
};

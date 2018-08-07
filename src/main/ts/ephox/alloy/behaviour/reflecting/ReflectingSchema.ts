import { FieldSchema } from "@ephox/boulder";
import { Fun } from "@ephox/katamari";

export default [
  FieldSchema.strict('channel'),
  FieldSchema.strict('renderComponents'),
  FieldSchema.defaulted('prepare', Fun.identity)
];
import { FieldPresence, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Adt, Fun, Id, Option } from '@ephox/katamari';

const adt = Adt.generate([
  { required: [ 'data' ] },
  { external: [ 'data' ] },
  { optional: [ 'data' ] },
  { group: [ 'data' ] }
]);

const fFactory = FieldSchema.defaulted('factory', { sketch: Fun.identity });
const fSchema = FieldSchema.defaulted('schema', [ ]);
const fName = FieldSchema.strict('name');
const fPname = FieldSchema.field(
  'pname',
  'pname',
  FieldPresence.defaultedThunk(function (typeSpec) {
    return '<alloy.' + Id.generate(typeSpec.name) + '>';
  }),
  ValueSchema.anyValue()
);

const fDefaults = FieldSchema.defaulted('defaults', Fun.constant({ }));
const fOverrides = FieldSchema.defaulted('overrides', Fun.constant({ }));

const requiredSpec = ValueSchema.objOf([
  fFactory, fSchema, fName, fPname, fDefaults, fOverrides
]);

const externalSpec = ValueSchema.objOf([
  fFactory, fSchema, fName, fDefaults, fOverrides
]);

const optionalSpec = ValueSchema.objOf([
  fFactory, fSchema, fName, fPname, fDefaults, fOverrides
]);

const groupSpec = ValueSchema.objOf([
  fFactory, fSchema, fName,
  FieldSchema.strict('unit'),
  fPname, fDefaults, fOverrides
]);

const asNamedPart = function (part) {
  return part.fold(Option.some, Option.none, Option.some, Option.some);
};

const name = function (part) {
  const get = function (data) {
    return data.name();
  };

  return part.fold(get, get, get, get);
};

const asCommon = function (part) {
  return part.fold(Fun.identity, Fun.identity, Fun.identity, Fun.identity);
};

const convert = function (adtConstructor, partSpec) {
  return function (spec) {
    const data = ValueSchema.asStructOrDie('Converting part type', partSpec, spec);
    return adtConstructor(data);
  };
};

export default <any> {
  required: convert(adt.required, requiredSpec),
  external: convert(adt.external, externalSpec),
  optional: convert(adt.optional, optionalSpec),
  group: convert(adt.group, groupSpec),
  asNamedPart,
  name,
  asCommon,

  original: Fun.constant('entirety')
};
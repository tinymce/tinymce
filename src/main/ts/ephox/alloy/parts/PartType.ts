import { FieldPresence } from '@ephox/boulder';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Adt } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Id } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var adt = Adt.generate([
  { required: [ 'data' ] },
  { external: [ 'data' ] },
  { optional: [ 'data' ] },
  { group: [ 'data' ] }
]);

var fFactory = FieldSchema.defaulted('factory', { sketch: Fun.identity });
var fSchema = FieldSchema.defaulted('schema', [ ]);
var fName = FieldSchema.strict('name');
var fPname = FieldSchema.field(
  'pname',
  'pname',
  FieldPresence.defaultedThunk(function (typeSpec) {
    return '<alloy.' + Id.generate(typeSpec.name) + '>';
  }),
  ValueSchema.anyValue()
);

var fDefaults = FieldSchema.defaulted('defaults', Fun.constant({ }));
var fOverrides = FieldSchema.defaulted('overrides', Fun.constant({ }));

var requiredSpec = ValueSchema.objOf([
  fFactory, fSchema, fName, fPname, fDefaults, fOverrides
]);

var externalSpec = ValueSchema.objOf([
  fFactory, fSchema, fName, fDefaults, fOverrides
]);

var optionalSpec = ValueSchema.objOf([
  fFactory, fSchema, fName, fPname, fDefaults, fOverrides
]);

var groupSpec = ValueSchema.objOf([
  fFactory, fSchema, fName,
  FieldSchema.strict('unit'),
  fPname, fDefaults, fOverrides
]);

var asNamedPart = function (part) {
  return part.fold(Option.some, Option.none, Option.some, Option.some);
};

var name = function (part) {
  var get = function (data) {
    return data.name();
  };

  return part.fold(get, get, get, get);
};

var asCommon = function (part) {
  return part.fold(Fun.identity, Fun.identity, Fun.identity, Fun.identity);
};

var convert = function (adtConstructor, partSpec) {
  return function (spec) {
    var data = ValueSchema.asStructOrDie('Converting part type', partSpec, spec);
    return adtConstructor(data);
  };
};

export default <any> {
  required: convert(adt.required, requiredSpec),
  external: convert(adt.external, externalSpec),
  optional: convert(adt.optional, optionalSpec),
  group: convert(adt.group, groupSpec),
  asNamedPart: asNamedPart,
  name: name,
  asCommon: asCommon,

  original: Fun.constant('entirety')
};
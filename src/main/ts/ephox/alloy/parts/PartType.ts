import { FieldPresence, FieldSchema, ValueSchema, DslType } from '@ephox/boulder';
import { Adt, Fun, Id, Option } from '@ephox/katamari';
import { DetailedSpec } from '../parts/AlloyParts';
import { RawDomSchema } from '../api/ui/Sketcher';
import { AdtInterface } from '../alien/TypeDefinitions';

export type PartType = (spec: { [key: string]: any }) => DslType.FieldProcessorAdt;
export interface BuildSpec {
  defaults: () => () => {};
  factory: () => any;
  name: () => string;
  overrides: () => OverrideHandler;
  pname: () => string;
  schema: () => DslType.FieldProcessorAdt[];
}

export type OverrideHandler = (detail: DetailedSpec, spec?: RawDomSchema, partValidated?: any) => OverrideSpec;

export interface OverrideSpec {
  [key: string]: any;
}

export interface PartTypeAdt extends AdtInterface {
  // TODO, def this out
}

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

const asNamedPart = function (part: PartTypeAdt): Option<BuildSpec> {
  return part.fold(Option.some, Option.none, Option.some, Option.some);
};

const name = function (part: PartTypeAdt): string {
  const get = function (data) {
    return data.name();
  };
  return part.fold(get, get, get, get);
};

const asCommon = function (part: PartTypeAdt): BuildSpec {
  return part.fold(Fun.identity, Fun.identity, Fun.identity, Fun.identity);
};

const convert = function (adtConstructor, partSpec) {
  return function (spec) {
    const data = ValueSchema.asStructOrDie('Converting part type', partSpec, spec);
    return adtConstructor(data);
  };
};

const required = convert(adt.required, requiredSpec) as PartType;
const external = convert(adt.external, externalSpec) as PartType;
const optional = convert(adt.optional, optionalSpec) as PartType;
const group = convert(adt.group, groupSpec) as PartType;
const original = Fun.constant('entirety');

export {
  required,
  external,
  optional,
  group,
  asNamedPart,
  name,
  asCommon,

  original
};
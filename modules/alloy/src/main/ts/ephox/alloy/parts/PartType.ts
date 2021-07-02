import { FieldPresence, FieldProcessor, FieldSchema, StructureProcessor, StructureSchema, ValueType } from '@ephox/boulder';
import { Adt, Fun, Id, Optional } from '@ephox/katamari';

import { SimpleOrSketchSpec } from '../api/component/SpecTypes';
import { CompositeSketchDetail } from '../api/ui/Sketcher';

type DeepPartial<T> = {
  [P in keyof T]?: Partial<T[P]>;
};

export type PartType<S, T = PartTypeAdt<S>> = (p: S) => T;

export interface BasePartDetail<D extends CompositeSketchDetail, PS> {
  defaults: OverrideHandler<D, PS>;
  factory: { sketch: (detail: PS & { uid: string }, ...rest: any[]) => any };
  name: string;
  overrides: OverrideHandler<D, PS>;
  pname: string;
  schema: FieldProcessor[];
}

export interface PartDetail<D extends CompositeSketchDetail, PS> extends BasePartDetail<D, PS> {
  factory: { sketch: (detail: PS & { uid: string }) => any };
}

export interface ExternalPartDetail<D extends CompositeSketchDetail, PS> extends BasePartDetail<D, PS> {
  factory: { sketch: (detail: PS & { uid: string }, partSpec: PS) => any };
}

export interface GroupPartDetail<D extends CompositeSketchDetail, PS> extends PartDetail<D, PS> {
  unit: string;
}

export interface PartSpec<D extends CompositeSketchDetail, PS> extends Partial<PartDetail<D, PS>> {
  name: string;
}

export interface ExternalPartSpec<D extends CompositeSketchDetail, PS> extends Partial<ExternalPartDetail<D, PS>> { }

export interface GroupPartSpec<D extends CompositeSketchDetail, PS> extends Partial<GroupPartDetail<D, PS>> {
  name: string;
  unit: string;
}

export type OverrideHandler<D, PS> = (detail: D, spec: PS, partValidated?: Record<string, any>) => DeepPartial<PS>;

export interface PartTypeAdt<S = BasePartDetail<any, any>> {
  fold: <T>(
    required: PartType<S, T>,
    external: PartType<S, T>,
    optional: PartType<S, T>,
    group: PartType<S, T>
  ) => T;
  match: <T>(branches: {
    required: PartType<S, T>;
    external: PartType<S, T>;
    optional: PartType<S, T>;
    group: PartType<S, T>;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  required: PartType<any>;
  external: PartType<any>;
  optional: PartType<any>;
  group: PartType<any>;
} = Adt.generate([
  { required: [ 'data' ] },
  { external: [ 'data' ] },
  { optional: [ 'data' ] },
  { group: [ 'data' ] }
]);

const fFactory = FieldSchema.defaulted('factory', { sketch: Fun.identity });
const fSchema = FieldSchema.defaulted('schema', [ ]);
const fName = FieldSchema.required('name');
const fPname = FieldSchema.field(
  'pname',
  'pname',
  FieldPresence.defaultedThunk((typeSpec: PartSpec<any, any>) => '<alloy.' + Id.generate(typeSpec.name) + '>'),
  ValueType.anyValue()
);

// Groups cannot choose their schema.
const fGroupSchema = FieldSchema.customField('schema', () => [
  FieldSchema.option('preprocess')
]);

const fDefaults = FieldSchema.defaulted('defaults', Fun.constant({ }));
const fOverrides = FieldSchema.defaulted('overrides', Fun.constant({ }));

const requiredSpec = StructureSchema.objOf([
  fFactory, fSchema, fName, fPname, fDefaults, fOverrides
]);

const externalSpec = StructureSchema.objOf([
  fFactory, fSchema, fName, fDefaults, fOverrides
]);

const optionalSpec = StructureSchema.objOf([
  fFactory, fSchema, fName, fPname, fDefaults, fOverrides
]);

const groupSpec = StructureSchema.objOf([
  fFactory, fGroupSchema, fName,
  FieldSchema.required('unit'),
  fPname, fDefaults, fOverrides
]);

const asNamedPart = <T>(part: PartTypeAdt<T>): Optional<T> => {
  return part.fold(Optional.some, Optional.none as () => Optional<T>, Optional.some, Optional.some);
};

const name = <T extends { name: string }>(part: PartTypeAdt<T>): string => {
  const get = (data: T) => data.name;
  return part.fold(get, get, get, get);
};

const asCommon = <T>(part: PartTypeAdt<T>): T => {
  return part.fold(Fun.identity, Fun.identity, Fun.identity, Fun.identity);
};

const convert = <D extends CompositeSketchDetail, S, PS extends PartSpec<D, S>, PD extends PartDetail<D, S>>(adtConstructor: PartType<PD>, partSchema: StructureProcessor) => (spec: PS): PartTypeAdt<PD> => {
  const data = StructureSchema.asRawOrDie('Converting part type', partSchema, spec);
  return adtConstructor(data);
};

const required: (<D extends CompositeSketchDetail, PS = SimpleOrSketchSpec> (p: PartSpec<D, PS>) => PartTypeAdt<PartDetail<D, PS>>) = convert(adt.required, requiredSpec) as any;
const external: (<D extends CompositeSketchDetail, PS = SimpleOrSketchSpec> (p: ExternalPartSpec<D, PS>) => PartTypeAdt<ExternalPartDetail<D, PS>>) = convert(adt.external, externalSpec) as any;
const optional: (<D extends CompositeSketchDetail, PS = SimpleOrSketchSpec> (p: PartSpec<D, PS>) => PartTypeAdt<PartDetail<D, PS>>) = convert(adt.optional, optionalSpec) as any;
const group: (<D extends CompositeSketchDetail, PS = SimpleOrSketchSpec> (p: GroupPartSpec<D, PS>) => PartTypeAdt<GroupPartDetail<D, PS>>) = convert(adt.group, groupSpec) as any;
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

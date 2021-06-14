import { FieldProcessor, FieldSchema, StructureSchema } from '@ephox/boulder';
import { Obj } from '@ephox/katamari';

import * as FunctionAnnotator from '../../debugging/FunctionAnnotator';
import * as AlloyParts from '../../parts/AlloyParts';
import { PartTypeAdt } from '../../parts/PartType';
import { BaseSketchDetail, BaseSketchSpec } from '../../spec/SpecSchema';
import { AlloyComponent } from '../component/ComponentApi';
import { AlloySpec, SketchSpec } from '../component/SpecTypes';
import * as GuiTypes from './GuiTypes';
import * as UiSketcher from './UiSketcher';

export interface SingleSketchSpec extends BaseSketchSpec { }
export interface SingleSketchDetail extends BaseSketchDetail<SingleSketchSpec> { }

type SketcherApisFunc<A, R> = (apis: A, comp: AlloyComponent, ...rest: any[]) => R;
type FunctionRecord<A> = { [K in keyof A]: Function };
type SketcherApisFuncRecord<A extends FunctionRecord<A>> = { [K in keyof A]: A[K] };

export interface SingleSketch<S extends SingleSketchSpec> {
  readonly name: string;
  readonly configFields: FieldProcessor[];
  readonly sketch: (spec: S) => SketchSpec;
}

export interface SingleSketcherSpec<S extends SingleSketchSpec, D extends SingleSketchDetail, A extends FunctionRecord<A>, E extends FunctionRecord<E> = {}> {
  name: string;
  factory: UiSketcher.SingleSketchFactory<D, S>;
  configFields: FieldProcessor[];
  apis?: Record<string, SketcherApisFunc<A, any>>;
  extraApis?: E;
}

export interface SingleSketcherRawDetail<S extends SingleSketchSpec, D extends SingleSketchDetail, A extends FunctionRecord<A>, E extends FunctionRecord<E> = {}> {
  name: string;
  factory: UiSketcher.SingleSketchFactory<D, S>;
  configFields: FieldProcessor[];
  apis: Record<string, SketcherApisFunc<A, any>>;
  extraApis: E;
}

export interface CompositeSketchSpec extends BaseSketchSpec { }
export interface CompositeSketchDetail extends BaseSketchDetail<CompositeSketchSpec> {
  parts: Record<string, any>;
  partUids: Record<string, string>;
}

export interface CompositeSketch<S extends CompositeSketchSpec> {
  readonly name: string;
  readonly configFields: FieldProcessor[];
  readonly partFields: PartTypeAdt[];
  readonly sketch: (spec: S) => SketchSpec;
  readonly parts: AlloyParts.GeneratedParts;
}

export interface CompositeSketcherSpec<S extends CompositeSketchSpec, D extends CompositeSketchDetail, A extends FunctionRecord<A>, E extends FunctionRecord<E> = {}> {
  name: string;
  factory: UiSketcher.CompositeSketchFactory<D, S>;
  configFields: FieldProcessor[];
  partFields: PartTypeAdt[];
  apis?: Record<string, SketcherApisFunc<A, any>>;
  extraApis?: E;
}

export interface CompositeSketcherRawDetail<S extends CompositeSketchSpec, D extends CompositeSketchDetail, A extends FunctionRecord<A>, E extends FunctionRecord<E> = {}> {
  name: string;
  factory: UiSketcher.CompositeSketchFactory<D, S>;
  configFields: FieldProcessor[];
  partFields: PartTypeAdt[];
  apis: Record<string, SketcherApisFunc<A, any>>;
  extraApis: E;
}

export const isSketchSpec = (spec: AlloySpec): spec is SketchSpec => {
  return (spec as SketchSpec).uid !== undefined;
};

const singleSchema = StructureSchema.objOfOnly([
  FieldSchema.required('name'),
  FieldSchema.required('factory'),
  FieldSchema.required('configFields'),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('extraApis', { })
]);

const compositeSchema = StructureSchema.objOfOnly([
  FieldSchema.required('name'),
  FieldSchema.required('factory'),
  FieldSchema.required('configFields'),
  FieldSchema.required('partFields'),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('extraApis', { })
]);

const single = <
  S extends SingleSketchSpec,
  D extends SingleSketchDetail,
  A extends FunctionRecord<A>,
  E extends FunctionRecord<E> = {}
>(rawConfig: SingleSketcherSpec<S, D, A, E>): SingleSketch<S> & A & E => {
  const config: SingleSketcherRawDetail<S, D, A> = StructureSchema.asRawOrDie('Sketcher for ' + rawConfig.name, singleSchema, rawConfig);

  const sketch = (spec: S) => UiSketcher.single(config.name, config.configFields, config.factory, spec);

  const apis = Obj.map(config.apis, GuiTypes.makeApi) as any as SketcherApisFuncRecord<A>;
  const extraApis = Obj.map(config.extraApis, (f, k) => FunctionAnnotator.markAsExtraApi(f, k)) as E;

  return {
    name: config.name,
    configFields: config.configFields,
    sketch,
    ...apis,
    ...extraApis
  };
};

const composite = <
  S extends CompositeSketchSpec,
  D extends CompositeSketchDetail,
  A extends FunctionRecord<A>,
  E extends FunctionRecord<E> = {}
>(rawConfig: CompositeSketcherSpec<S, D, A, E>): CompositeSketch<S> & A & E => {
  const config: CompositeSketcherRawDetail<S, D, A> = StructureSchema.asRawOrDie('Sketcher for ' + rawConfig.name, compositeSchema, rawConfig);

  const sketch = (spec: S) => UiSketcher.composite(config.name, config.configFields, config.partFields, config.factory, spec);

  // These are constructors that will store their configuration.
  const parts: AlloyParts.GeneratedParts = AlloyParts.generate(config.name, config.partFields);

  const apis = Obj.map(config.apis, GuiTypes.makeApi) as any as SketcherApisFuncRecord<A>;
  const extraApis = Obj.map(config.extraApis, (f, k) => FunctionAnnotator.markAsExtraApi(f, k)) as E;

  return {
    name: config.name,
    partFields: config.partFields,
    configFields: config.configFields,
    sketch,
    parts,
    ...apis,
    ...extraApis
  };
};

export {
  single,
  composite
};

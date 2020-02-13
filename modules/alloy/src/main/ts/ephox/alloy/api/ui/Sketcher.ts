import { FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Obj } from '@ephox/katamari';

import { AlloySpec, SketchSpec } from '../../api/component/SpecTypes';
import * as FunctionAnnotator from '../../debugging/FunctionAnnotator';
import * as AlloyParts from '../../parts/AlloyParts';
import { PartTypeAdt } from '../../parts/PartType';
import { BaseSketchDetail, BaseSketchSpec } from '../../spec/SpecSchema';
import { AlloyComponent } from '../component/ComponentApi';
import * as GuiTypes from './GuiTypes';
import * as UiSketcher from './UiSketcher';

export interface SingleSketchSpec extends BaseSketchSpec { }
export interface SingleSketchDetail extends BaseSketchDetail<SingleSketchSpec> { }

type SketcherApisFunc<A, R> = (apis: A, comp: AlloyComponent, ...rest: any[]) => R;
type FunctionRecord<A> = { [K in keyof A]: Function };
type SketcherApisFuncRecord<A extends FunctionRecord<A>> = { [K in keyof A]: A[K] };

export interface SingleSketch<S extends SingleSketchSpec> {
  name: () => string;
  configFields: () => FieldProcessorAdt[];
  sketch: (spec: S) => SketchSpec;
}

export interface SingleSketcherSpec<S extends SingleSketchSpec, D extends SingleSketchDetail, A extends FunctionRecord<A>, E extends FunctionRecord<E> = {}> {
  name: string;
  factory: UiSketcher.SingleSketchFactory<D, S>;
  configFields: FieldProcessorAdt[];
  apis?: Record<string, SketcherApisFunc<A, any>>;
  extraApis?: E;
}

export interface SingleSketcherRawDetail<S extends SingleSketchSpec, D extends SingleSketchDetail, A extends FunctionRecord<A>, E extends FunctionRecord<E> = {}> {
  name: string;
  factory: UiSketcher.SingleSketchFactory<D, S>;
  configFields: FieldProcessorAdt[];
  apis: Record<string, SketcherApisFunc<A, any>>;
  extraApis: E;
}

export interface CompositeSketchSpec extends BaseSketchSpec { }
export interface CompositeSketchDetail extends BaseSketchDetail<CompositeSketchSpec> {
  parts: Record<string, any>;
  partUids: Record<string, string>;
}

export interface CompositeSketch<S extends CompositeSketchSpec>  {
  name: () => string;
  configFields: () => FieldProcessorAdt[];
  partFields: () => PartTypeAdt[];
  sketch: (spec: S) => SketchSpec;
  parts: () => AlloyParts.GeneratedParts;
}

export interface CompositeSketcherSpec<S extends CompositeSketchSpec, D extends CompositeSketchDetail, A extends FunctionRecord<A>, E extends FunctionRecord<E> = {}> {
  name: string;
  factory: UiSketcher.CompositeSketchFactory<D, S>;
  configFields: FieldProcessorAdt[];
  partFields: PartTypeAdt[];
  apis?: Record<string, SketcherApisFunc<A, any>>;
  extraApis?: E;
}

export interface CompositeSketcherRawDetail<S extends CompositeSketchSpec, D extends CompositeSketchDetail, A extends FunctionRecord<A>, E extends FunctionRecord<E> = {}> {
  name: string;
  factory: UiSketcher.CompositeSketchFactory<D, S>;
  configFields: FieldProcessorAdt[];
  partFields: PartTypeAdt[];
  apis: Record<string, SketcherApisFunc<A, any>>;
  extraApis: E;
}

export function isSketchSpec(spec: AlloySpec): spec is SketchSpec {
  return (<SketchSpec> spec).uid !== undefined;
}

const singleSchema = ValueSchema.objOfOnly([
  FieldSchema.strict('name'),
  FieldSchema.strict('factory'),
  FieldSchema.strict('configFields'),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('extraApis', { })
]);

const compositeSchema = ValueSchema.objOfOnly([
  FieldSchema.strict('name'),
  FieldSchema.strict('factory'),
  FieldSchema.strict('configFields'),
  FieldSchema.strict('partFields'),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('extraApis', { })
]);

const single = function <S extends SingleSketchSpec, D extends SingleSketchDetail, A extends FunctionRecord<A>, E extends FunctionRecord<E> = {}>(rawConfig: SingleSketcherSpec<S, D, A, E>): SingleSketch<S> & A & E {
  const config: SingleSketcherRawDetail<S, D, A> = ValueSchema.asRawOrDie('Sketcher for ' + rawConfig.name, singleSchema, rawConfig);

  const sketch = (spec: S) => {
    return UiSketcher.single(config.name, config.configFields, config.factory, spec);
  };

  const apis = Obj.map(config.apis, GuiTypes.makeApi) as any as SketcherApisFuncRecord<A>;
  const extraApis = Obj.map(config.extraApis, (f, k) => {
    return FunctionAnnotator.markAsExtraApi(f, k);
  }) as E;

  return {
    name: Fun.constant(config.name),
    configFields: Fun.constant(config.configFields),
    sketch,
    ...apis,
    ...extraApis
   };
};

const composite = function <S extends CompositeSketchSpec, D extends CompositeSketchDetail, A extends FunctionRecord<A>, E extends FunctionRecord<E> = {}>(rawConfig: CompositeSketcherSpec<S, D, A, E>): CompositeSketch<S> & A & E {
  const config: CompositeSketcherRawDetail<S, D, A> = ValueSchema.asRawOrDie('Sketcher for ' + rawConfig.name, compositeSchema, rawConfig);

  const sketch = (spec: S) => {
    return UiSketcher.composite(config.name, config.configFields, config.partFields, config.factory, spec);
  };

  // These are constructors that will store their configuration.
  const parts: AlloyParts.GeneratedParts = AlloyParts.generate(config.name, config.partFields);

  const apis = Obj.map(config.apis, GuiTypes.makeApi) as any as SketcherApisFuncRecord<A>;
  const extraApis = Obj.map(config.extraApis, (f, k) => {
    return FunctionAnnotator.markAsExtraApi(f, k);
  }) as E;

  return {
    name: Fun.constant(config.name),
    partFields: Fun.constant(config.partFields),
    configFields: Fun.constant(config.configFields),
    sketch,
    parts: Fun.constant(parts),
    ...apis,
    ...extraApis
   };
};

export {
  single,
  composite
};

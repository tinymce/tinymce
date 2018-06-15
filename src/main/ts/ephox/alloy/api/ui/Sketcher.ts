import { FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Merger, Obj } from '@ephox/katamari';

import { AlloySpec, SketchSpec, LooseSpec } from '../../api/component/SpecTypes';
import * as FunctionAnnotator from '../../debugging/FunctionAnnotator';
import * as AlloyParts from '../../parts/AlloyParts';
import * as GuiTypes from './GuiTypes';
import * as UiSketcher from './UiSketcher';
import { SingleSketchFactory, CompositeSketchFactory } from './UiSketcher';

// TYPIFY: Not sure what goes in this yet.
export interface SingleSketchSpec { };
export interface SingleSketchDetail { };

export interface SingleSketch<S extends SingleSketchSpec, D extends SingleSketchDetail> {
  name: () => string;
  configFields: () => FieldProcessorAdt[];
  sketch: (spec: S) => SketchSpec;
  factory: SingleSketchFactory<D, S>;
  [key: string]: Function;
}

export interface CompositeSketchSpec { };
export interface CompositeSketchDetail { };

export interface CompositeSketch<S extends CompositeSketchSpec, D extends CompositeSketchDetail>  {
  name: () => string;
  configFields: () => FieldProcessorAdt[];
  partFields: () => FieldProcessorAdt[];
  sketch: (spec: S) => SketchSpec;
  parts: () => AlloyParts.GeneratedParts;
  // TYPIFY externals
  factory: CompositeSketchFactory<D, S>;
  [key: string]: Function;
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

const single = function <S extends SingleSketchSpec, D extends SingleSketchDetail>(rawConfig) {
  const config = ValueSchema.asRawOrDie('Sketcher for ' + rawConfig.name, singleSchema, rawConfig);

  const sketch = function (spec) {
    return UiSketcher.single(config.name, config.configFields, config.factory, spec);
  };

  const apis = Obj.map(config.apis, GuiTypes.makeApi);
  const extraApis = Obj.map(config.extraApis, function (f, k) {
    return FunctionAnnotator.markAsExtraApi(f, k);
  });

  return Merger.deepMerge(
    {
      name: Fun.constant(config.name),
      partFields: Fun.constant([ ]),
      configFields: Fun.constant(config.configFields),

      sketch
    },
    apis,
    extraApis
  ) as SingleSketch<S, D>;
};

const composite = function <S extends CompositeSketchSpec, D extends CompositeSketchDetail>(rawConfig) {
  const config = ValueSchema.asRawOrDie('Sketcher for ' + rawConfig.name, compositeSchema, rawConfig);

  const sketch = function (spec) {
    return UiSketcher.composite(config.name, config.configFields, config.partFields, config.factory, spec);
  };

  // These are constructors that will store their configuration.
  const parts: AlloyParts.GeneratedParts = AlloyParts.generate(config.name, config.partFields);

  const apis = Obj.map(config.apis, GuiTypes.makeApi);
  const extraApis = Obj.map(config.extraApis, function (f, k) {
    return FunctionAnnotator.markAsExtraApi(f, k);
  });

  return Merger.deepMerge(
    {
      name: Fun.constant(config.name),
      partFields: Fun.constant(config.partFields),
      configFields: Fun.constant(config.configFields),
      sketch,
      parts: Fun.constant(parts)
    },
    apis,
    extraApis
  ) as CompositeSketch<S, D>;
};

export {
  single,
  composite
};
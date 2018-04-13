import { DslType, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Merger, Obj } from '@ephox/katamari';
import { EventHandlerConfig } from '../../api/events/AlloyEvents';

import * as FunctionAnnotator from '../../debugging/FunctionAnnotator';
import * as AlloyParts from '../../parts/AlloyParts';
import * as GuiTypes from './GuiTypes';
import * as UiSketcher from './UiSketcher';
import { AlloyBehaviourSchema } from '../../api/behaviour/Behaviour';

export interface RawElementSchema {
  tag: string;
  attributes?: Record<string, any>;
  styles?: Record<string, string>;
  innerHtml?: string;
  classes?: string[];
}

export type AlloyComponentsSpec = RawDomSchema[] | SketchSpec[];
export type AlloyMixedSpec = RawDomSchema | SketchSpec;

export interface SingleSketch {
  name: () => string;
  configFields: () => DslType.FieldProcessorAdt[];
  partFields: () => DslType.FieldProcessorAdt[];
  sketch: (spec: Record<string, any>) => SketchSpec;
  factory: UiSketcher.SingleFactory;
}

export interface CompositeSketch  {
  name: () => string;
  configFields: () => DslType.FieldProcessorAdt[];
  partFields: () => DslType.FieldProcessorAdt[];
  sketch: (spec: Record<string, any>) => SketchSpec;

  parts: () => any;
  factory: UiSketcher.CompositeFactory;
  [key: string]: Function;
}

// TODO: Morgan -> check these
export interface RawDomSchema {
  dom: RawElementSchema;
  components?: AlloyComponentsSpec;
  items?: RawDomSchema[];
  type?: string;
  data?: {};
  markers?: {};
  behaviours?: Record<string, AlloyBehaviourSchema>;
  events?: EventHandlerConfig | {};
}

export interface RawDomSchemaUid extends RawDomSchema {
  uid: string;
}

// TODO: Morgan -> check these, should domModification and eventOrder be part of RawDomSchema too?
export interface SketchSpec extends RawDomSchema {
  domModification: {};
  eventOrder: {};
  uid: string;
  'debug.sketcher': {};
}

export function isSketchSpec(spec: RawDomSchema | SketchSpec): spec is SketchSpec {
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

const single = function (rawConfig) {
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
  ) as SingleSketch;
};

const composite = function (rawConfig) {
  const config = ValueSchema.asRawOrDie('Sketcher for ' + rawConfig.name, compositeSchema, rawConfig);

  const sketch = function (spec) {
    return UiSketcher.composite(config.name, config.configFields, config.partFields, config.factory, spec);
  };

  // These are constructors that will store their configuration.
  const parts = AlloyParts.generate(config.name, config.partFields);

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
  ) as CompositeSketch;
};

export {
  single,
  composite
};
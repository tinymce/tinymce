import GuiTypes from './GuiTypes';
import UiSketcher from './UiSketcher';
import FunctionAnnotator from '../../debugging/FunctionAnnotator';
import AlloyParts from '../../parts/AlloyParts';
import PartType from '../../parts/PartType';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';

var singleSchema = ValueSchema.objOfOnly([
  FieldSchema.strict('name'),
  FieldSchema.strict('factory'),
  FieldSchema.strict('configFields'),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('extraApis', { })
]);

var compositeSchema = ValueSchema.objOfOnly([
  FieldSchema.strict('name'),
  FieldSchema.strict('factory'),
  FieldSchema.strict('configFields'),
  FieldSchema.strict('partFields'),
  FieldSchema.defaulted('apis', { }),
  FieldSchema.defaulted('extraApis', { })
]);

var single = function (rawConfig) {
  var config = ValueSchema.asRawOrDie('Sketcher for ' + rawConfig.name, singleSchema, rawConfig);

  var sketch = function (spec) {
    return UiSketcher.single(config.name, config.configFields, config.factory, spec);
  };

  var apis = Obj.map(config.apis, GuiTypes.makeApi);
  var extraApis = Obj.map(config.extraApis, function (f, k) {
    return FunctionAnnotator.markAsExtraApi(f, k);
  });

  return Merger.deepMerge(
    {
      name: Fun.constant(config.name),
      partFields: Fun.constant([ ]),
      configFields: Fun.constant(config.configFields),

      sketch: sketch
    },
    apis,
    extraApis
  );
};

var composite = function (rawConfig) {
  var config = ValueSchema.asRawOrDie('Sketcher for ' + rawConfig.name, compositeSchema, rawConfig);

  var sketch = function (spec) {
    return UiSketcher.composite(config.name, config.configFields, config.partFields, config.factory, spec);
  };

  // These are constructors that will store their configuration.
  var parts = AlloyParts.generate(config.name, config.partFields);

  var apis = Obj.map(config.apis, GuiTypes.makeApi);
  var extraApis = Obj.map(config.extraApis, function (f, k) {
    return FunctionAnnotator.markAsExtraApi(f, k);
  });

  return Merger.deepMerge(
    {
      name: Fun.constant(config.name),
      partFields: Fun.constant(config.partFields),
      configFields: Fun.constant(config.configFields),
      sketch: sketch,
      parts: Fun.constant(parts)
    },
    apis,
    extraApis
  );
};

export default <any> {
  single: single,
  composite: composite
};
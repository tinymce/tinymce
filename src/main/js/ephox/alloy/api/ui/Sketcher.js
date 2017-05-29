define(
  'ephox.alloy.api.ui.Sketcher',

  [
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.debugging.FunctionAnnotator',
    'ephox.alloy.parts.AlloyParts',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Obj'
  ],

  function (GuiTypes, UiSketcher, FunctionAnnotator, AlloyParts, PartType, FieldSchema, ValueSchema, Fun, Merger, Obj) {
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

    return {
      single: single,
      composite: composite
    };
  }
);

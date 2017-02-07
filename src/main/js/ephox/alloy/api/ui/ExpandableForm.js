define(
  'ephox.alloy.api.ui.ExpandableForm',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.ExpandableFormSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Focus'
  ],

  function (Behaviour, Keying, Representing, Sliding, Button, Form, GuiTypes, UiSketcher, Fields, PartType, ExpandableFormSchema, FieldSchema, Merger, Fun, Class, Focus) {
    var runOnExtra = function (detail, operation) {
      return function (anyComp) {
        var extraOpt = anyComp.getSystem().getByUid(detail.partUids()['extra']);
        extraOpt.each(operation);
      };
    };

    var schema = ExpandableFormSchema.schema();
    var partTypes = ExpandableFormSchema.parts();

    // Dupe with Tiered Menu
    var sketch = function (spec) {
      return UiSketcher.composite(ExpandableFormSchema.name(), schema, partTypes, make, spec);
    };

    var make = function (detail, components, spec, _externals) {
      return {
        uid: detail.uid(),
        dom: detail.dom(),
        components: components,

        behaviours: {
          representing: {
            store: {
              mode: 'manual',
              getValue: function (form) {
                var minimal = form.getSystem().getByUid(detail.partUids().minimal).getOrDie();
                var extra = form.getSystem().getByUid(detail.partUids().extra).getOrDie();

                var minimalValues = Representing.getValue(minimal);
                var extraValues = Representing.getValue(extra);
                return Merger.deepMerge(
                  minimalValues,
                  extraValues
                );
              },
              setValue: function (form, values) {
                var minimal = form.getSystem().getByUid(detail.partUids().minimal).getOrDie();
                var extra = form.getSystem().getByUid(detail.partUids().extra).getOrDie();

                // ASSUMPTION: Form ignore values that it does not have.
                Representing.setValue(minimal, values);
                Representing.setValue(extra, values);
              }
            }
          }
        },

        apis: {
          toggleForm: runOnExtra(detail, Sliding.toggleGrow),
          collapseForm: runOnExtra(detail, Sliding.shrink),
          collapseFormImmediately: runOnExtra(detail, Sliding.immediateShrink),
          expandForm: runOnExtra(detail, Sliding.grow)
        }
      };

    };

    var parts = PartType.generate(ExpandableFormSchema.name(), partTypes);

    return Merger.deepMerge(
      {
        sketch: sketch,
        parts: Fun.constant(parts)
      },
      GuiTypes.makeApis([ 'toggleForm', 'collapseForm', 'collapseFormImmediately', 'expandForm' ])
    );
  }
);
define(
  'ephox.alloy.api.ui.ExpandableForm',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.ExpandableFormSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger'
  ],

  function (Behaviour, Representing, Sliding, GuiTypes, UiSketcher, PartType, ExpandableFormSchema, Fun, Merger) {
    var runOnExtra = function (detail, operation) {
      return function (anyComp) {
        var extraOpt = anyComp.getSystem().getByUid(detail.partUids().extra);
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

        behaviours: Merger.deepMerge(
          Behaviour.derive([
            Representing.config({
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
            })
          ]),
          detail.expandableBehaviours()
        ),

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
        schemas: Fun.constant(ExpandableFormSchema),
        parts: Fun.constant(parts),
        toggleForm: GuiTypes.makeApi(function (apis, component) {
          apis.toggleForm(component);
        }),
        collapseForm: GuiTypes.makeApi(function (apis, component) {
          apis.collapseForm(component);
        }),
        collapseFormImmediately: GuiTypes.makeApi(function (apis, component) {
          apis.collapseFormImmediately(component);
        }),
        expandForm: GuiTypes.makeApi(function (apis, component) {
          apis.expandForm(component);
        })
      }
    );
  }
);
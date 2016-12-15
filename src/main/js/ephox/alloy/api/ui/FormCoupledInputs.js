define(
  'ephox.alloy.api.ui.FormCoupledInputs',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Composing, Toggling, Button, FormField, Input, UiBuilder, EventHandler, Fields, PartType, FieldSchema, Fun, Option) {
    var schema = [
      FieldSchema.strict('onLockedChange'),
      Fields.markers([ 'lockClass' ])
    ];

    var formInput = {
      build: function (spec) {
        return FormField.build(Input, spec);
      }
    };

    var getPart = function (comp, detail, partName) {
      return comp.getSystem().getByUid(detail.partUids()[partName]).fold(Option.none, Option.some);
    };

    var getField = function (comp, detail, partName) {
      return getPart(comp, detail, partName).bind(Composing.getCurrent);
    };

    var partTypes = [
      PartType.internal(
        formInput,
        'field1',
        '<alloy.coupled-inputs.field1>',
        Fun.constant({ }),
        function (detail) {
          return {
            events: {
              'input': EventHandler.nu({
                run: function (field1) {
                  getField(field1, detail, 'field2').each(function (field2) {
                    getPart(field1, detail, 'lock').each(function (lock) {
                      if (Toggling.isSelected(lock)) detail.onLockedChange()(field1, field1, field2, lock);
                    });
                  });
                }
              })
            }
          };
        }
      ),

      // FIX: Dupe
      PartType.internal(
        formInput,
        'field2',
        '<alloy.coupled-inputs.field2>',
        Fun.constant({ }),
        function (detail) {
          return {
            events: {
              'input': EventHandler.nu({
                run: function (field2) {
                  getField(field2, detail, 'field1').each(function (field1) {
                    getPart(field2, detail, 'lock').each(function (lock) {
                      if (Toggling.isSelected(lock)) detail.onLockedChange()(field1, field2, field1, lock);
                    });
                  });
                }
              })
            }
          };
        }
      ),

      PartType.internal(
        Button,
        'lock',
        '<alloy.coupled-inputs.lock>',
        Fun.constant({ }),
        function (detail) {
          return {
            behaviours: {
              toggling: {
                toggleClass: detail.markers().lockClass()
              }
            }
          };
        }
      )
    ];

    var build = function (spec) {
      return UiBuilder.composite('coupled-inputs', schema, partTypes, make, spec);
    };

    var make = function (detail, components, spec, externals) { 
      return {
        uiType: 'custom',
        uid: detail.uid(),
        dom: detail.dom(),
        components: components
      };
    };

    var parts = PartType.generate('coupled-inputs', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);
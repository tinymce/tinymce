define(
  'ephox.alloy.api.ui.FormCoupledInputs',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (Composing, Toggling, CompositeBuilder, FormField, Input, EventHandler, Fields, PartType, FieldSchema, Fun) {
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
      return comp.getSystem().getByUid(detail.partUids()[partName]);
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
                  getPart(field1, detail, 'field-2').each(function (field2) {
                    getPart(field2, detail, 'lock').each(function (lock) {
                      if (Toggling.isSelected(lock)) {
                        var f1 = Composing.getCurrent(field1);
                        var f2 = Composing.getCurrent(field2);
                        detail.onLockedChange()(field1, f1, f2, lock);
                      }
                    });
                  });
                }
              })
            }
          };
        }
      )
    ];

    /*
         '<alloy.form.lock>': UiSubstitutes.single(true,  
          Merger.deepMerge(
            info.parts().lock(),
            {
              uid: info.partUids().lock,
              toggling: {
                toggleClass: info.markers().lockClass()
              }
            }
          )
        )
        */

    var build = function (f) {
      return CompositeBuilder.build('coupled-inputs', schema, partTypes, make, f);
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
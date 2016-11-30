define(
  'ephox.alloy.form.CoupledTextInputSpec',

  [
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
    'ephox.alloy.form.TextInputSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (Toggling, EventHandler, Fields, TextInputSpec, SpecSchema, UiSubstitutes, FieldSchema, Merger, Option) {
    var schema = [
      FieldSchema.strict('uid'),
      FieldSchema.strict('components'),
      FieldSchema.strict('dom'),

      FieldSchema.strict('onLockedChange'),

      Fields.markers([ 'lockClass' ]),

      FieldSchema.state('builder', function () {
        return builder;
      })
    ].concat(
      SpecSchema.getPartsSchema([
        'field-1',
        'field-2',
        'lock'
      ])
    );

    // '<alloy.form.field-input>': UiSubstitutes.single(
    //       detail.parts().field()
    //     ),
    //     '<alloy.form.field-label>': UiSubstitutes.single(
    //       Merger.deepMerge(

    // Would perfer a much better way of doing this, but things like aspect ratios
    // Have to know which is which.
  
    var builder = function (info, munge) {


      var getPart = function (comp, part) {
        return comp.getSystem().getByUid(info.partUids()[part]);
      };

      var getDelegate = function (field) {
        return field.delegate().map(function (dlg) {
          return dlg.get()(field);
        }).getOr(field);
      };

      var placeholders = {
        '<alloy.form.field-1>': UiSubstitutes.single(
          TextInputSpec.make(
            Merger.deepMerge(
              info.parts()['field-1'](),
              munge(info.parts()['field-1']()),
              {
                uid: info.partUids()['field-1']
              },
              {
                events: {
                  'input': EventHandler.nu({
                    run: function (field1) {
                      getPart(field1, 'field-2').each(function (field2) {
                        getPart(field2, 'lock').each(function (lock) {

                          if (Toggling.isSelected(lock)) {
                            info.onLockedChange()(field1, getDelegate(field1), getDelegate(field2), lock);
                          }
                        });
                      });
                    }
                  })
                }
              }
            ),
            munge
          )
        ),
        '<alloy.form.field-2>': UiSubstitutes.single(
          TextInputSpec.make(
            Merger.deepMerge(
              info.parts()['field-2'](),
              munge(info.parts()['field-2']()),
              {
                uid: info.partUids()['field-2']
              },
              {
                events: {
                  'input': EventHandler.nu({
                    run: function (field2) {
                      getPart(field2, 'field-1').each(function (field1) {
                        getPart(field2, 'lock').each(function (lock) {
                          if (Toggling.isSelected(lock)) {
                            // Order is important
                            info.onLockedChange()(field2, getDelegate(field2), getDelegate(field1), lock);
                          }
                        });
                      });
                    }
                  })
                }
              }
            ),
            munge
          )
        ),
        '<alloy.form.lock>': UiSubstitutes.single(
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
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('coupled-text-input'),
        info,
        info.components(),
        placeholders,
        { }
      );

      return {
        uiType: 'custom',
        uid: info.uid(),
        dom: info.dom(),
        components: components
      };
    };

    return schema;
  }
);
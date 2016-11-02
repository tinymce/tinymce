define(
  'ephox.alloy.spec.ExpandableFormSpec',

  [
    'ephox.alloy.spec.FormSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (FormSpec, SpecSchema, UiSubstitutes, Arr, Obj, Merger, Option) {
    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('Form', [ ], spec, [
        'minimal-form',
        'extra-form',
        'expander',
        'controls'
      ]);

      var toggleForm = function (anyComp) {
        var extraOpt = anyComp.getSystem().getByUid(detail.partUids()['extra-form']);
        extraOpt.each(function (extra) {
          extra.apis().toggleGrow();
        });
      };

      var collapseForm = function (anyComp) {
        var extraOpt = anyComp.getSystem().getByUid(detail.partUids()['extra-form']);
        extraOpt.each(function (extra) {
          extra.apis().shrink();
        });
      };

      var expandForm = function (anyComp) {
        var extraOpt = anyComp.getSystem().getByUid(detail.partUids()['extra-form']);
        extraOpt.each(function (extra) {
          extra.apis().grow();
        });
      };

      var placeholders = {
        '<alloy.expandable-form.minimal-form>': UiSubstitutes.single(
          Merger.deepMerge(
            detail.parts()['minimal-form'](),
            detail.parts()['minimal-form'].base,
            {
              uid: detail.partUids()['minimal-form']
            }
          )
        ),
        '<alloy.expandable-form.extra-form>': UiSubstitutes.single(
          Merger.deepMerge(
            detail.parts()['extra-form'](),
            detail.parts()['extra-form'].base,
            {
              uid: detail.partUids()['extra-form'],
              sliding: {
                mode: 'height',
                closedStyle: 'demo-sliding-closed',
                openStyle: 'demo-sliding-open',
                shrinkingStyle: 'demo-sliding-height-shrinking',
                growingStyle: 'demo-sliding-height-growing',
                expanded: true,
                onShrunk: function () {
                  console.log('height.slider.shrunk');
                },
                onGrown: function () {
                  console.log('height.slider.grown');
                }
              }
            }
          )
        ),
        '<alloy.expandable-form.expander>': UiSubstitutes.single(
          Merger.deepMerge(
            detail.parts()['expander'](),
            detail.parts()['expander'].base,
            {
              uid: detail.partUids().expander,
              uiType: 'button',
              action: toggleForm
            }
          )
        ),
        '<alloy.expandable-form.controls>': UiSubstitutes.single(
          Merger.deepMerge(
            detail.parts()['controls'](),
            detail.parts()['controls'].base,
            {
              uid: detail.partUids().controls
            }
          )
        )
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('expandable-form'),
        detail,
        detail.components(),
        placeholders,
        { }
      );

      var fieldParts = Obj.bifilter(spec.parts, function (v, k) {
        return !Arr.contains([ 'minimal-form', 'extra-form', 'expander', 'controls' ], k);
      }).t;


      return FormSpec.make(
        Merger.deepMerge(
          spec, 
          {
            uid: detail.uid(),
            components: components
          },
          // Doubled up to remove old parts.
          {
            parts: undefined
          },
          {
            parts: fieldParts
          },
          {
            apis: {
              toggleForm: toggleForm,
              collapseForm: collapseForm,
              expandForm: expandForm
            }
          }
        )
      );
    };

    return {
      make: make
    };
  }
);
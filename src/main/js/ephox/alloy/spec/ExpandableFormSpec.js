define(
  'ephox.alloy.spec.ExpandableFormSpec',

  [
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.data.Fields',
    'ephox.alloy.spec.FormSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Class'
  ],

  function (Sliding, Fields, FormSpec, SpecSchema, UiSubstitutes, FieldSchema, Arr, Obj, Merger, Fun, Option, Class) {
    var schema = [
      Fields.markers([
        'closedStyle',
        'openStyle',
        'shrinkingStyle',
        'growingStyle',

        // TODO: Sync with initial value
        'expandedClass',
        'collapsedClass'
      ]),
      FieldSchema.defaulted('onShrunk', Fun.identity),
      FieldSchema.defaulted('onGrown', Fun.identity)
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('Form', schema, spec, [
        'minimal-form',
        'extra-form',
        'expander',
        'controls'
      ]);

      var toggleForm = function (anyComp) {
        var extraOpt = anyComp.getSystem().getByUid(detail.partUids()['extra-form']);
        extraOpt.each(Sliding.toggleGrow);
      };

      var collapseForm = function (anyComp) {
        var extraOpt = anyComp.getSystem().getByUid(detail.partUids()['extra-form']);
        extraOpt.each(Sliding.shrink);
      };

      var collapseFormImmediately = function (anyComp) {
        var extraOpt = anyComp.getSystem().getByUid(detail.partUids()['extra-form']);
        extraOpt.each(Sliding.immediateShrink);
      }

      var expandForm = function (anyComp) {
        var extraOpt = anyComp.getSystem().getByUid(detail.partUids()['extra-form']);
        extraOpt.each(Sliding.grow);
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
                closedStyle: detail.markers().closedStyle(),
                openStyle: detail.markers().openStyle(),
                shrinkingStyle: detail.markers().shrinkingStyle(),
                growingStyle: detail.markers().growingStyle(),
                expanded: true,
                onStartShrink: function (extra) {
                  extra.getSystem().getByUid(detail.uid()).each(function (form) {
                    detail.markers().expandedClass().each(function (ec) { Class.remove(form.element(), ec); });
                    detail.markers().collapsedClass().each(function (cs) { Class.add(form.element(), cs); });
                  });
                },
                onStartGrow: function (extra) {
                  extra.getSystem().getByUid(detail.uid()).each(function (form) {
                    detail.markers().expandedClass().each(function (ec) { Class.add(form.element(), ec); });
                    detail.markers().collapsedClass().each(function (cs) { Class.remove(form.element(), cs); });
                  });
                },
                onShrunk: function (extra) {
                  detail.onShrunk()(extra);
                  console.log('height.slider.shrunk');
                },
                onGrown: function (extra) {
                  detail.onGrown()(extra);
                  console.log('height.slider.grown');
                },
                getAnimationRoot: function (extra) {
                  return extra.getSystem().getByUid(detail.uid()).getOrDie().element();
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
              collapseFormImmediately: collapseFormImmediately,
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
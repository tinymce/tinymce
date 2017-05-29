define(
  'ephox.alloy.api.ui.FormChooser',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.ui.schema.FormChooserSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.SelectorFilter'
  ],

  function (Behaviour, Composing, Highlighting, Keying, Representing, AlloyEvents, SystemEvents, Sketcher, FormChooserSchema, Arr, Merger, Option, Attr, SelectorFilter) {
    var factory = function (detail, components, spec, externals) {
      var findByValue = function (chooser, value) {
        var choices = SelectorFilter.descendants(chooser.element(), '.' + detail.markers().choiceClass());
        var choiceComps = Arr.map(choices, function (c) {
          return chooser.getSystem().getByDom(c).getOrDie();
        });

        return Arr.find(choiceComps, function (c) {
          return Representing.getValue(c) === value;
        });
      };

      return {
        uid: detail.uid(),
        dom: detail.dom(),
        components: components,

        behaviours: Merger.deepMerge(
          Behaviour.derive([
            Keying.config({
              mode: 'flow',
              selector: '.' + detail.markers().choiceClass(),
              executeOnMove: true,
              getInitial: function (chooser) {
                return Highlighting.getHighlighted(chooser).map(function (choice) {
                  return choice.element();
                });
              },
              execute: function (chooser, simulatedEvent, focused) {
                return chooser.getSystem().getByDom(focused).map(function (choice) {
                  Highlighting.highlight(chooser, choice);
                  return true;
                });
              }
            }),

            Highlighting.config({
              itemClass: detail.markers().choiceClass(),
              highlightClass: detail.markers().selectedClass(),
              onHighlight: function (chooser, choice) {
                Attr.set(choice.element(), 'aria-checked', 'true');
              },
              onDehighlight: function (chooser, choice) {
                Attr.set(choice.element(), 'aria-checked', 'false');
              }
            }),

            Composing.config({
              find: Option.some
            }),

            Representing.config({
              store: {
                mode: 'manual',
                setValue: function (chooser, value) {
                  findByValue(chooser, value).each(function (choiceWithValue) {
                    Highlighting.highlight(chooser, choiceWithValue);
                  });
                },
                getValue: function (chooser) {
                  return Highlighting.getHighlighted(chooser).map(Representing.getValue);
                }
              }
            })
          ]),
          detail.chooserBehaviours()
        ),

        events: AlloyEvents.derive([
          AlloyEvents.runWithTarget(SystemEvents.execute(), Highlighting.highlight),
          AlloyEvents.runOnAttached(Highlighting.highlightFirst)
        ])
      };
    };

    return Sketcher.composite({
      name: 'FormChooser',
      configFields: FormChooserSchema.schema(),
      partFields: FormChooserSchema.parts(),
      factory: factory
    });
  }
);
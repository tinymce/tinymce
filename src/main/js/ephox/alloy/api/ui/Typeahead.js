define(
  'ephox.alloy.api.ui.Typeahead',

  [
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.spec.TypeaheadSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'ephox.violin.Strings'
  ],

  function (Coupling, Representing, Sandboxing, CompositeBuilder, InternalSink, PartType, TypeaheadSpec, FieldSchema, Merger, Fun, Option, Cell, Strings) {
    var schema = [
      FieldSchema.strict('lazySink'),
      FieldSchema.strict('fetch'),
      FieldSchema.strict('dom'),
      FieldSchema.option('lazySink'),
      FieldSchema.defaulted('minChars', 5),
      FieldSchema.defaulted('onOpen', Fun.noop),
      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.defaulted('matchWidth', true),
      FieldSchema.defaulted('toggleClass', 'alloy-selected-button'),

      FieldSchema.state('previewing', function () {
        return Cell(true);
      })
    ];

    var partTypes = [
      PartType.external(
        'menu',
        function (detail) {
          return { };
        },
        function (detail) {
          return {
            fakeFocus: true,
            onHighlight: function (menu, item) {
              if (! detail.previewing().get()) {
                menu.getSystem().getByUid(detail.uid()).each(function (input) {
                  Representing.setValueFrom(input, item);
                });
              } else {
                // Highlight the rest of the text so that the user types over it.
                menu.getSystem().getByUid(detail.uid()).each(function (input) {
                  // FIX: itemData.value
                  var currentValue = Representing.getValue(input).text;
                  var nextValue = Representing.getValue(item);
                  if (Strings.startsWith(nextValue.text, currentValue)) {
                    Representing.setValue(input, nextValue);
                    input.element().dom().setSelectionRange(currentValue.length, nextValue.text.length);
                  }
                  
                });
              }
              detail.previewing().set(false);
            },
            onExecute: function (menu, item) {
              return menu.getSystem().getByUid(detail.uid()).bind(function (typeahead) {
                var sandbox = Coupling.getCoupled(typeahead, 'sandbox');
                Sandboxing.close(sandbox);
                return item.getSystem().getByUid(detail.uid()).bind(function (input) {
                  // FIX: itemData.text
                  Representing.setValueFrom(input, item);
                  var currentValue = Representing.getValue(input);
                  input.element().dom().setSelectionRange(currentValue.text.length, currentValue.text.length);
                  // Should probably streamline this one.
                  detail.onExecute()(sandbox, input);
                  return Option.some(true);
                });
              });
            }
          };
        }
      )
    ];

    var build = function (f) {
      return CompositeBuilder.build('dropdown', schema, partTypes, TypeaheadSpec.make, f, function (spec) {
        return Merger.deepMerge(spec, {
          fetch: function (input) {
            input.logSpec();
            var val = Representing.getValue(input);
            return spec.fetch(input, val.text);
          }
        });
      });
    };

    return {
      build: build
    };
  }
);
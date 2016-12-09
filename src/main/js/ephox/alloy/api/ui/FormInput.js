define(
  'ephox.alloy.api.ui.FormInput',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Composing, Representing, CompositeBuilder, Input, PartType, FieldSchema, Fun, Option) {
    var schema = [
      // FieldSchema.strict('components'),
      // FieldSchema.option('placeholder')
      // If the current value is empty, on focus, take the value of the placeholder
      // FieldSchema.defaulted('stickyPlaceholder', false),
      // FieldSchema.defaulted('inline', true)
    ];

    var partTypes = [
      PartType.optional(
        { build: Fun.identity },
        'label',
        '<alloy.input.label>',
        Fun.constant({ }),
        Fun.constant({ })
      ),
      PartType.internal(
        Input,
        'field',
        '<alloy.input.field>',
        Fun.constant({ }),
        Fun.constant({ })
      )
    ];

    var build = function (spec) {
      console.log('spec', spec);
      return CompositeBuilder.build('form-input', schema, partTypes, make, spec);
    };

    var make = function (detail, components, spec, externals) {
      return {
        uiType: 'custom',
        dom: {
          tag: 'span'
        },
        components: components,
        behaviours: {
          composing: {
            find: function (container) {
              return container.getSystem().getByUid(detail.partUids().field).fold(Option.none, Option.some);
            }
          },
          representing:  {
            initialValue: { value: '', text: '' },
            store: {
              mode: 'manual',
              getValue: function (container) {
                return Composing.getCurrent(container).bind(function (current) {
                  return Representing.getValue(current);
                });
              },
              setValue: function (container, newValue) {
                Composing.getCurrent(container).each(function (current) {
                  Representing.setValue(current, newValue);
                });
              }
            }
          }
        }
      };
    };

    var parts = PartType.generate('form-input', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);
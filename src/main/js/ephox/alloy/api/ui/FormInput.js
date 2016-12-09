define(
  'ephox.alloy.api.ui.FormInput',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.api.ui.common.FieldParts',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.epithet.Id',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr'
  ],

  function (SystemEvents, Composing, Representing, CompositeBuilder, Input, FieldParts, EventHandler, PartType, FieldSchema, Objects, Id, Fun, Option, Attr) {
    var schema = [
      FieldSchema.defaulted('prefix', 'form-input')
      // FieldSchema.strict('components'),
      // FieldSchema.option('placeholder')
      // If the current value is empty, on focus, take the value of the placeholder
      // FieldSchema.defaulted('stickyPlaceholder', false),
      // FieldSchema.defaulted('inline', true)
    ];

    var build = function (spec) {
      console.log('spec', spec);
      return CompositeBuilder.build('form-input', schema, FieldParts, make, spec);
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
        },

        events: Objects.wrap(
          SystemEvents.systemInit(),
          EventHandler.nu({
            run: function (component) {
              var system = component.getSystem();
              system.getByUid(detail.partUids().label).each(function (label) {
                system.getByUid(detail.partUids().field).each(function (field) {
                  var id = Id.generate(detail.prefix());
                              
                  // TODO: Find a nicer way of doing this.
                  Attr.set(label.element(), 'for', id);
                  Attr.set(field.element(), 'id', id);    
                });
              });          
            }
          })
        )
      };
    };

    var parts = PartType.generate('form-input', FieldParts);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);
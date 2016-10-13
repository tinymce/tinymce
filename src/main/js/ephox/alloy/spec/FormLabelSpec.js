define(
  'ephox.alloy.spec.FormLabelSpec',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.epithet.Id',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Attr'
  ],

  function (FieldSchema, ValueSchema, Id, Cell, Attr) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('label'),
      FieldSchema.strict('field')
    ]);

    var make = function (spec) {
      var detail = ValueSchema.asStructOrDie('input.spec', schema, spec);

      var field = Cell(undefined);

      return {
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        components: [
          {
            uiType: 'custom',
            dom: {
              tag: 'label',
              innerHtml: detail.label()
            }
          },
          detail.field()
        ],
        // Find a nicer way to do this. I'm trying to avoid building any components
        // in these specs.
        delegate: {
          get: function () {
            return field.get();
          }
        },
        postprocess: function (components) {
          var id = Id.generate('form-field');
          field.set(components[1]);
          Attr.set(components[0].element(), 'for', id);
          Attr.set(components[1].element(), 'id', id);
        }
      };
    };

    return {
      make: make
    };
  }
);
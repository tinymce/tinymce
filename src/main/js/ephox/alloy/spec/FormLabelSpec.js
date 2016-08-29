define(
  'ephox.alloy.spec.FormLabelSpec',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.epithet.Id',
    'ephox.sugar.api.Attr'
  ],

  function (FieldSchema, ValueSchema, Id, Attr) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('label'),
      FieldSchema.strict('field'),
      FieldSchema.defaulted('concise', false)
    ]);

    var make = function (spec) {
      var detail = ValueSchema.asStructOrDie('input.spec', schema, spec);

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
        postprocess: function (components) {
          var id = Id.generate('form-field');
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
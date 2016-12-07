define(
  'ephox.alloy.spec.FormLabelSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.epithet.Id',
    'ephox.highway.Merger',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Attr'
  ],

  function (SystemEvents, EventHandler, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, Objects, ValueSchema, Id, Merger, Option, Cell, Attr) {
    var schema = [
      FieldSchema.strictObjOf('label', [
        FieldSchema.strict('text')
      ]),
      FieldSchema.strict('prefix'),
      FieldSchema.strict('dom'),
      FieldSchema.strict('components'),
      FieldSchema.defaulted('inline', false)
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('input.spec', schema, spec, [
        'field',
        'label'
      ]);

      console.log('inline', detail.inline());

      var placeholders = {
        '<alloy.form.field-input>': UiSubstitutes.single(true,  
          Merger.deepMerge(
            detail.parts().field(),
            {
              uid: detail.partUids().field
            }
          ) 
        ),
        '<alloy.form.field-label>': UiSubstitutes.single(true,  
          Merger.deepMerge(
            detail.parts().label(),
            {
              uiType: 'custom',
              uid: detail.partUids().label,
              dom: {
                tag: 'label',
                innerHtml: detail.label().text()
              }
            },
            detail.inline() ? {
              dom: {
                styles: {
                  display: 'none'
                }
              }
            } : { }
          )
        )
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('formlabel'),
        detail,
        detail.components(),
        placeholders,
        { }
      );

      return Merger.deepMerge(spec, {
        uiType: 'custom',
        dom: detail.dom(),
        components: components,
        // Find a nicer way to do this. I'm trying to avoid building any components
        // in these specs.
        delegate: {
          get: function (formlabel) {
            return formlabel.getSystem().getByUid(detail.partUids().field).getOr(formlabel);
          }
        },
        events: Objects.wrap(
          SystemEvents.systemInit(),
          EventHandler.nu({
            run: function (component) {
              var system = component.getSystem();
              var id = Id.generate(detail.prefix());
              system.getByUid(detail.partUids().field).each(function (field) {
                system.getByUid(detail.partUids().label).each(function (label) {
                  Attr.set(label.element(), 'for', id);
                  Attr.set(field.element(), 'id', id);    
                });
              });          
            }
          })
        )
      });
    };

    return {
      make: make
    };
  }
);
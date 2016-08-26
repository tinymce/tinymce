define(
  'ephox.alloy.behaviour.Tabstopping',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Behaviour, DomModification, FieldPresence, FieldSchema, Objects, ValueSchema, Fun) {
    var schema = FieldSchema.field(
      'tabstopping',
      'tabstopping',
      FieldPresence.asDefaultedOption({
        'tabAttr': 'data-alloy-tabstop'
      }),
      ValueSchema.objOf([
        FieldSchema.defaulted('tabAttr', 'data-alloy-tabstop')
      ])
    );

    var exhibit = function (info, base) {
      return info.tabstopping().fold(function () {
        return DomModification.nu({ });
      }, function (tabInfo) {
        return DomModification.nu({
          attributes: Objects.wrapAll([
            { key: tabInfo.tabAttr(), value: 'true' }
          ])
        });
      });
    };

    return Behaviour.contract({
      name: Fun.constant('tabstopping'),
      exhibit: exhibit,
      handlers: Fun.constant({ }),
      apis: Fun.constant({ }),
      schema: Fun.constant(schema)
    });
  }
);
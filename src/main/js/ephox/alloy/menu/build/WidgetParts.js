define(
  'ephox.alloy.menu.build.WidgetParts',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.parts.PartType',
    'ephox.katamari.api.Fun'
  ],

  function (Behaviour, Representing, PartType, Fun) {
    var owner = 'item-widget';

    var partTypes = [
      PartType.required({
        name: 'widget',
        overrides: function (detail) {
          return {
            behaviours: Behaviour.derive([
              Representing.config({
                store: {
                  mode: 'manual',
                  getValue: function (component) {
                    return detail.data();
                  },
                  setValue: function () { }
                }
              })
            ])
          };
        }
      })
    ];

    return {
      owner: Fun.constant(owner),
      parts: Fun.constant(partTypes)
    };
  }
);

define(
  'ephox.alloy.api.ui.menus.MenuData',

  [
    'ephox.boulder.api.Objects'
  ],

  function (Objects) {
    var simple = function (name, label, future) {
      return future.map(function (items) {
        return {
          primary: name,
          menus: Objects.wrap(
            name,
            {
              value: name,
              text: label,
              items: items
            }
          ),
          expansions: { }
        };
      });
    };

    var tiered = function (primary, menus, expansions) {
      return {
        primary: primary,
        menus: menus,
        expansions: expansions
      };
    };

    var single = function (name, label, item) {
      return {
        primary: name,
        menus: Objects.wrap(name, {
          value: name,
          text: label,
          items: [ item ]
        }),
        expansions: { }
      };
    };

    return {
      simple: simple,
      tiered: tiered,
      single: single
    };
  }
);
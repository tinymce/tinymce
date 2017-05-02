define(
  'ephox.alloy.behaviour.tabstopping.ActiveTabstopping',

  [
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.Objects'
  ],

  function (DomModification, Objects) {
    var exhibit = function (base, tabConfig) {
      return DomModification.nu({
        attributes: Objects.wrapAll([
          { key: tabConfig.tabAttr(), value: 'true' }
        ])
      });
    };

    return {
      exhibit: exhibit
    };
  }
);
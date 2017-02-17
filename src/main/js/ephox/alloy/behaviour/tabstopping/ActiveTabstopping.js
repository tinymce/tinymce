define(
  'ephox.alloy.behaviour.tabstopping.ActiveTabstopping',

  [
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.Objects'
  ],

  function (DomModification, Objects) {
    var exhibit = function (base, tabInfo) {
      return DomModification.nu({
        attributes: Objects.wrapAll([
          { key: tabInfo.tabAttr(), value: 'true' }
        ])
      });
    };

    return {
      exhibit: exhibit
    };
  }
);
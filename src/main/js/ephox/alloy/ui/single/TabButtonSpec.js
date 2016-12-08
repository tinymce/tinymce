define(
  'ephox.alloy.ui.single.TabButtonSpec',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.epithet.Id',
    'ephox.highway.Merger'
  ],

  function (BehaviourExport, DomModification, Tagger, ButtonBase, Id, Merger) {
    var make = function (detail, spec) {
      
      var events = ButtonBase.events(detail.action());

      return Merger.deepMerge(
        {
          events: events
        },

        {
          behaviours: {
            focusing: true,
            keying: {
              mode: 'execution',
              useSpace: true,
              useEnter: true
            }
          }
        },

        {
          dom: {
            attributes: {
              type: 'button',
              id: Id.generate('aria'),
              role: detail.role().getOr('tab')
            }
          }
        },

        spec, 

        {
          uiType: 'custom'
        }
      );
    };

    return {
      make: make
    };
  }
);
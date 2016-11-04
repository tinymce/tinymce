define(
  'ephox.alloy.api.behaviour.Representing',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.highway.Merger'
  ],

  function (BehaviourExport, Merger) {
    // This is clumsy.
    var self = Merger.deepMerge(
      BehaviourExport.build(
        'representing',
        [
          'getValue',
          'setValue',
          'setValueFrom'
        ],
        { }
      ),
      {
        setValueFrom: function (component, source) {
          var value = self.getValue(source);
          self.setValue(component, value);
        }
      }
    );

    return self;
  }
);
define(
  'ephox.alloy.api.behaviour.Representing',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.representing.ActiveRepresenting',
    'ephox.alloy.behaviour.representing.RepresentApis',
    'ephox.alloy.behaviour.representing.RepresentSchema'
  ],

  function (BehaviourExport, ActiveRepresenting, RepresentApis, RepresentSchema) {
    // This is clumsy.
    var self = BehaviourExport.santa(
      RepresentSchema,
      'representing',
      ActiveRepresenting,
      RepresentApis,
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
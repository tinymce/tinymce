define(
  'ephox.alloy.api.behaviour.Representing',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.representing.ActiveRepresenting',
    'ephox.alloy.behaviour.representing.RepresentApis',
    'ephox.alloy.behaviour.representing.RepresentSchema'
  ],

  function (Behaviour, ActiveRepresenting, RepresentApis, RepresentSchema) {
    // This is clumsy.
    var self = Behaviour.create(
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
define(
  'ephox.alloy.api.behaviour.Representing',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.representing.ActiveRepresenting',
    'ephox.alloy.behaviour.representing.RepresentApis',
    'ephox.alloy.behaviour.representing.RepresentSchema',
    'ephox.alloy.behaviour.representing.RepresentState'
  ],

  function (Behaviour, ActiveRepresenting, RepresentApis, RepresentSchema, RepresentState) {
    // The self-reference is clumsy.
    var me = Behaviour.create({
      fields: RepresentSchema,
      name: 'representing',
      active: ActiveRepresenting,
      apis: RepresentApis,
      extra: {
        setValueFrom: function (component, source) {
          var value = me.getValue(source);
          me.setValue(component, value);
        }
      },
      state: RepresentState
    });

    return me;
  }
);
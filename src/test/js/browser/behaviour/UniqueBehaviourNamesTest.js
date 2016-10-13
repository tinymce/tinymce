test(
  'UniqueBehaviourNamesTest',

  [
    'ephox.alloy.construct.CustomDefinition',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'global!Error'
  ],

  function (CustomDefinition, Objects, ValueSchema, Arr, Error) {
    var infoOption = CustomDefinition.toInfo({
      dom: {
        tag: 'div'
      },
      components: [ ]
    });
    var info = ValueSchema.getOrDie(infoOption);
    console.log('info', info);
    var behaviours = CustomDefinition.behaviours(info);

    var unique = { };
    Arr.each(behaviours, function (b) {
      if (Objects.hasKey(unique, b.name())) throw new Error('Behaviour: ' + b.name() + ' exists more than once');
      unique[b.name()] = true;
    });
  }
);
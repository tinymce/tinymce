test(
  'DefaultedTest',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.lumber.api.Timers',
    'ephox.peanut.Fun'
  ],

  function (FieldPresence, FieldSchema, ValueSchema, Timers, Fun) {
    return;
    var fields = [ ];

    for (var i = 0; i < 40000; i++) {
      fields[i] = FieldSchema.field(
        'a' + i,
        'a' + i,
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.field(
            'dog',
            'dog',
            FieldPresence.asOption(),
            ValueSchema.objOf([
              FieldPresence.defaulted('cat', 'cat'),
              FieldPresence.defaulted('elephant', 'elephant')

            ])
          )
          // FieldSchema.strict('dog')
        ])
      );
    }


    var spec = { };
    for (var j = 0; j < 10000; j++) {
      spec['a' + j] = true;
    }


    var x = Timers.run('running boulder', function () {
      return ValueSchema.asStruct('performance :: DefaultedTest', ValueSchema.objOf(fields), spec);
    });
    Timers.log();

    ValueSchema.getOrDie(x);


  }
);
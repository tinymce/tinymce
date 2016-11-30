test(
  'StrictTest',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.lumber.api.Timers',
    'ephox.peanut.Fun'
  ],

  function (FieldSchema, ValueSchema, Timers, Fun) {
    var fields = [ ];

    for (var i = 0; i < 20200; i++) {
      fields[i] = FieldSchema.strict('a' + i);
    }


    var spec = { };
    for (var j = 0; j < 10000; j++) {
      spec['a' + j] = true;
    }


    var x = Timers.run('running boulder', function () {
      return ValueSchema.asStruct('performance :: StateTest', ValueSchema.objOf(fields), spec);
    });
    Timers.log();

    ValueSchema.getOrDie(x);


  }
);
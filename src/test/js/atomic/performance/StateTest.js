test(
  'StateTest',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.lumber.api.Timers',
    'ephox.peanut.Fun'
  ],

  function (FieldSchema, ValueSchema, Timers, Fun) {
    var fields = [ ];

    for (var i = 0; i < 10000; i++) {
      fields[i] = FieldSchema.state('state' + i, Fun.constant('x'));
    }


    var spec = {
      a: 'a',
      b: 'b'
    };

    var x = ValueSchema.asStructOrDie('performance :: StateTest', ValueSchema.objOf(fields), spec);
    console.log('x', Object.keys(x).length);
    Timers.log();


  }
);
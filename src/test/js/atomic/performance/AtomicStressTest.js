test(
  'AtomicStressTest',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (FieldSchema, ValueSchema, Merger, Fun) {
    // var ss = [ ];
    // for (var i = 0; i < 1000; i++) {
    //   ss[i] = FieldSchema.state('defin' + i, function () {
    //     return 5;
    //   });
    //   // ss[i] = FieldSchema.strict('defin' + i);
    // }

    // var before = new Date().getTime();
    // var res = ValueSchema.asStruct('custom.definition', ValueSchema.objOf(ss), { });
    // var after = new Date().getTime();
    // var elapsed = after - before;

    // console.log('Elapsed: ', elapsed + 'ms');
    // if (res.isError()) console.log('Result', ValueSchema.getOrDie(res));

    var f = Fun.constant;

    var a = { };
    for (var i = 0; i < 30000; i++) {
      a[i] = f(i);
      a[i + 'a'] = {
        b: f(i)
      };
    }

    var before = new Date().getTime();
    var res = Merger.deepMerge(a, a);
    var after = new Date().getTime();
    var elapsed = after - before;

    console.log('Elapsed: ', elapsed + 'ms');
    
  }
);
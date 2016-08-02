test(
  'ValueProcessorTest',

  [
    'ephox.boulder.api.Fields',
    'ephox.boulder.api.ValueProcessor'
  ],

  function (Fields, ValueProcessor) {
    var x = 10;
    assert.eq(10, ValueProcessor.value().weak(x).getOrDie());


    var y = [
      10, 20, 50
    ];
    assert.eq(y, ValueProcessor.arr(ValueProcessor.value()).weak(y).getOrDie());

    var z = {
      a: 'a',
      b: 'b'
    };

    assert.eq(z, ValueProcessor.obj([
      Fields.strict('a'),
      Fields.strict('b')
    ]).weak(z));

  }
);
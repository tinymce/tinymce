test(
  'JsValueTest',

  [
    'ephox.boulder.api.Fields',
    'ephox.boulder.api.JsValue'
  ],

  function (Fields, JsValue) {
    var x = 10;
    assert.eq(10, JsValue.value().weak(x).getOrDie());


    var y = [
      10, 20, 50
    ];
    assert.eq(y, JsValue.arr(JsValue.value()).weak(y).getOrDie());

    var z = {
      a: 'a',
      b: 'b'
    };

    assert.eq(z, JsValue.obj([
      Fields.strict('a'),
      Fields.strict('b')
    ]).weak(z));

  }
);
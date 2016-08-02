test(
  'JsValueTest',

  [
    'ephox.boulder.api.Fields',
    'ephox.boulder.api.JsValue'
  ],

  function (Fields, JsValue) {
    var x = 10;

    var aX = JsValue.value()(x);
    assert.eq(10, aX.getOrDie());


    var y = [
      10, 20, 50
    ];
    assert.eq(y, JsValue.arr(JsValue.value())(y).getOrDie());

    var z = {
      a: 'a',
      b: 'b'
    };

    assert.eq(z, JsValue.obj([
      Fields.strict('a'),
      Fields.strict('b')
    ])(z).getOrDie());

  }
);
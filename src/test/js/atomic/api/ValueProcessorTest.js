test(
  'ValueProcessorTest',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.Fields',
    'ephox.boulder.api.ValueProcessor'
  ],

  function (FieldPresence, Fields, ValueProcessor) {
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

    assert.eq(z, ValueProcessor.obj([ 'obj.path' ], [
      Fields.strict('a'),
      Fields.strict('b')
    ]).weak(z).getOrDie());




    var format = ValueProcessor.obj([ 'link.api' ], [
      Fields.arr('urls', 'urls', FieldPresence.strict(), [
        Fields.strict('url'),
        Fields.strict('fresh')
      ])
    ]);

    var h = {
      urls: [
        { url: 'hi', fresh: 'true' }
      ]
    };

    assert.eq(h, format.weak(h).getOrDie());

  }
);
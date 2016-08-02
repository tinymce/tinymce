test(
  'ValueProcessorTest',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.Fields',
    'ephox.boulder.api.ValueProcessor',
    'ephox.classify.Type',
    'ephox.perhaps.Result'
  ],

  function (FieldPresence, Fields, ValueProcessor, Type, Result) {


    var check = function (input, processor) {
      assert.eq(input, processor.weak(input).getOrDie());
    };


    var any = Result.value;


    check(10, ValueProcessor.value(any));

    check([ 10, 20, 50 ], ValueProcessor.arr(
      ValueProcessor.value(any)
    ));

    check({
      a: 'a',
      b: 'b'
    }, ValueProcessor.obj([ 'obj.path' ], [
      ValueProcessor.field('a', 'a', FieldPresence.strict(), ValueProcessor.value(any)),
      ValueProcessor.field('b', 'b', FieldPresence.strict(), ValueProcessor.value(any))
    ]));

    check({
      urls: [
        { url: 'hi', fresh: 'true' }
      ]
    }, ValueProcessor.obj(
      [ 'link.api' ], [
        ValueProcessor.field('urls', 'urls', FieldPresence.strict(), ValueProcessor.arr(ValueProcessor.obj([ 'arr' ], [
          ValueProcessor.field('url', 'url', FieldPresence.strict(), ValueProcessor.value(any)),
          ValueProcessor.field('fresh', 'fresh', FieldPresence.strict(), ValueProcessor.value(any))
        ])))
      ]
    ));

    check({
      urls: [ 'dog', 'cat' ]
    }, ValueProcessor.obj(
      [ 'link.api' ],
      [
        ValueProcessor.field('urls', 'urls', FieldPresence.strict(), ValueProcessor.arr(ValueProcessor.value(function (s) {
          return Type.isString(s) ? Result.value(s) : Result.error('needs to be a string');
        })))
      ]
    ));

  }
);
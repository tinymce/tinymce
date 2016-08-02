test(
  'ValueProcessorTest',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.Fields',
    'ephox.boulder.api.ValueProcessor',
    'ephox.boulder.api.ValueSchema',
    'ephox.classify.Type',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result'
  ],

  function (FieldPresence, Fields, ValueProcessor, ValueSchema, Type, Fun, Result) {


    var check = function (label, input, processor) {
      assert.eq(input, processor.extract([ label ], Fun.identity, input).getOrDie());
    };



    check('test.1', 10, ValueSchema.anyValue());

    check('test.2', [ 10, 20, 50 ], ValueSchema.arrOfVal());

    check('test.3', {
      a: 'a',
      b: 'b'
    }, ValueProcessor.obj([
      ValueSchema.fields.strict('a'),
      ValueSchema.fields.strict('b')
    ]));

    // check({
    //   a: 'a',
    //   b: 'b'
    // }, ValueProcessor.obj([ 'obj.path' ], [
    //   ValueSchema.fields.strict('a'),
    //   ValueSchema.fields.strict('b')
    // ]));

    // check({
    //   urls: [
    //     { url: 'hi', fresh: 'true' },
    //     { url: 'hi', fresha: 'true' }
    //   ]
    // }, ValueProcessor.obj(
    //   [ 'link.api' ], [
    //     ValueSchema.fields.strictArrayOfObj('urls', [
    //       ValueSchema.fields.strict('url'),
    //       ValueSchema.fields.strict('fresh')
    //     ])
    //   ]
    // ));

    // check({
    //   urls: [ 'dog', 'cat' ]
    // }, ValueProcessor.obj(
    //   [ 'link.api' ],
    //   [
    //     ValueProcessor.field('urls', 'urls', FieldPresence.strict(), ValueProcessor.arr(ValueProcessor.value(function (s) {
    //       return Type.isString(s) ? Result.value(s) : Result.error('needs to be a string');
    //     })))
    //   ]
    // ));

  }
);
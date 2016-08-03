test(
  'ValueSchemaTest',

  [
    'ephox.boulder.api.ValueSchema'
  ],

  function (ValueSchema) {


    var check = function (label, input, processor) {
      assert.eq(input, ValueSchema.asRaw(label, processor, input).getOrDie());
    };

    check('test.1', 10, ValueSchema.anyValue());

    check('test.2', [ 10, 20, 50 ], ValueSchema.arrOfVal());

    check('test.3', {
      a: 'a',
      b: 'b'
    }, ValueSchema.objOf([
      ValueSchema.fields.strict('a'),
      ValueSchema.fields.strict('b')
    ]));

    check('test.4', {
      urls: [
        { url: 'hi', fresh: 'true' },
        { url: 'hi', fresh: 'true' }
      ]
    }, ValueSchema.objOf([
      ValueSchema.fields.strictArrayOfObj('urls', [
        ValueSchema.fields.strict('url'),
        ValueSchema.fields.defaulted('fresh', '10')
      ])
    ]));

    check('test.5', {
      urls: [ 'dog', 'cat' ]
    }, ValueSchema.objOf([
      ValueSchema.fields.strictArrayOf('urls', ValueSchema.anyValue())
    ]));


    var optionValue = ValueSchema.asRaw('test.option', ValueSchema.objOf([
      ValueSchema.fields.option('alpha')
    ]), {}).getOrDie();
    console.log('optionValue', optionValue);

    assert.eq(true, optionValue.alpha.isNone(), 'alpha should be none');

    var optionValue2 = ValueSchema.asRaw('test.option', ValueSchema.objOf([
      ValueSchema.fields.option('alpha')
    ]), { alpha: 'beta' }).getOrDie();
    console.log('optionValue2', optionValue2);

    assert.eq(true, optionValue2.alpha.isSome(), 'alpha should be some');

  }
);
test(
  'ValueSchemaRawTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.numerosity.api.JSON',
    'ephox.perhaps.Result'
  ],

  function (RawAssertions, FieldPresence, FieldSchema, ValueSchema, Json, Result) {
    var checkErr = function (label, expectedPart, input, processor) {
      ValueSchema.asRaw(label, processor, input).fold(function (err) {
        RawAssertions.assertEq(label + '. Was looking to see if contained: ' + expectedPart + '.\nWas: ' + err, true, err.indexOf(expectedPart) > -1);
      }, function (val) {
        assert.fail(label + '\nExpected error: ' + expectedPart + '\nWas success(' + Json.stringify(val, null, 2) + ')');
      });
    };
    var check = function (label, input, processor) {
      assert.eq(input, ValueSchema.asRaw(label, processor, input).getOrDie());
    };
  
    check('test.1', 10, ValueSchema.anyValue());

    check('test.2', [ 10, 20, 50 ], ValueSchema.arrOfVal());

    check('test.3', {
      a: 'a',
      b: 'b'
    }, ValueSchema.objOf([
      FieldSchema.strict('a'),
      FieldSchema.strict('b')
    ]));

    check('test.4', {
      urls: [
        { url: 'hi', fresh: 'true' },
        { url: 'hi', fresh: 'true' }
      ]
    }, ValueSchema.objOf([
      FieldSchema.strictArrayOfObj('urls', [
        FieldSchema.strict('url'),
        FieldSchema.defaulted('fresh', '10')
      ])
    ]));

    check('test.5', {
      urls: [ 'dog', 'cat' ]
    }, ValueSchema.objOf([
      FieldSchema.strictArrayOf('urls', ValueSchema.anyValue())
    ]));


    checkErr('test.6 should fail because fields do not both start with f', 
      'start-with-f',
      {
        'fieldA': { val: 'a' },
        'cieldB': { val: 'b' }
      }, ValueSchema.setOf(function (key) {
        return key.indexOf('f') > -1 ? Result.value(key) : Result.error('start-with-f error');
      }, ValueSchema.objOf([
        FieldSchema.strict('val')
      ]))
    );

    checkErr('test.6b should fail because values do not contain "val"', 
      'val',
      {
        'fieldA': { val2: 'a' },
        'fieldB': { val2: 'b' }
      }, ValueSchema.setOf(Result.value, ValueSchema.objOf([
        FieldSchema.strict('val')
      ]))
    );

    check('test.7', 
      {
        'fieldA': { val: 'a' },
        'fieldB': { val: 'b' }
      }, ValueSchema.setOf(Result.value, ValueSchema.objOf([
        FieldSchema.strict('val')
      ]))
    );

    var optionValue = ValueSchema.asRaw('test.option', ValueSchema.objOf([
      FieldSchema.option('alpha')
    ]), {}).getOrDie();    
    assert.eq(true, optionValue.alpha.isNone(), 'alpha should be none');

    var optionValue2 = ValueSchema.asRaw('test.option', ValueSchema.objOf([
      FieldSchema.option('alpha')
    ]), { alpha: 'beta' }).getOrDie();    
    assert.eq(true, optionValue2.alpha.isSome(), 'alpha should be some');

    var optionValue3 = ValueSchema.asRaw('test.option', ValueSchema.objOf([
      FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOption('fallback'), ValueSchema.anyValue())
    ]), { alpha: 'beta' }).getOrDie();    
    assert.eq('beta', optionValue3.alpha.getOrDie(), 'fallback.opt: alpha:beta should be some(beta)');

    var optionValue4 = ValueSchema.asRaw('test.option', ValueSchema.objOf([
      FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOption('fallback'), ValueSchema.anyValue())
    ]), { alpha: true }).getOrDie();    
    assert.eq('fallback', optionValue4.alpha.getOrDie(), 'fallback.opt: alpha:true should be some(fallback)');

    var optionValue5 = ValueSchema.asRaw('test.option', ValueSchema.objOf([
      FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOption('fallback'), ValueSchema.anyValue())
    ]), {  }).getOrDie();    
    assert.eq(true, optionValue5.alpha.isNone(), 'fallback.opt: no alpha should be none');


  }
);
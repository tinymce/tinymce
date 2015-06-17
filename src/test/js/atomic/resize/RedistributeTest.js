test(
  'RedistributeTest',

  [
    'ephox.snooker.resize.Redistribution'
  ],

  function (Redistribution) {
    var check = function (expected, input, originalWidth, newWidth) {
      assert.eq(expected, Redistribution.redistribute(input, originalWidth, newWidth));  
    };


    var checkValidate = function (expected, input) {
      var actual = Redistribution.toStr(Redistribution.validate(input));
      assert.eq(expected, actual);
    };

    checkValidate('pixels[10]', '10px');
    checkValidate('invalid[10pxe]', '10pxe');
    checkValidate('percent[10]', '10%');


    // check([ '50%', '10%' ], [ '10px', '10px' ], '20', '200%');
    
  }
);
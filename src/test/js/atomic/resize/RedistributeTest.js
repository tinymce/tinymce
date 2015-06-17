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

    // Put more tests in when it becomes clear that I need them
    checkValidate('pixels[10.5]', '10.5px');


    check([ '50%', '50%' ], [ '10px', '10px' ], '20', '200%');

    check([ '50%', '50%' ], [ '10px', '50%' ], '20', '200%');


    check([ '20px', '50%' ], [ '10px', '50%' ], '20', '40px');



    assert.eq('100px', Redistribution.sum([ '100px' ], '100', 10));
    assert.eq('50%', Redistribution.sum([ '50%' ], '100', 10));
    assert.eq('125px', Redistribution.sum([ '50%', '25px' ], '200', 10));
    
  }
);
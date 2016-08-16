test(
  'Immutable2Test',

  [
    'ephox.katamari.data.Immutable2'
  ],

  function (Immutable2) {

    var Frog = Immutable2.product(['name', 'age']);
    var kermit = Frog.nu('kermit', 33);
    var bermit = Frog.nu('bermit', 37);

    assert.eq('kermit', kermit.name());
    assert.eq(33, kermit.age());
    assert.eq(true, Frog.eq(kermit, kermit));
    assert.eq(false, Frog.eq(kermit, bermit));

    assert.eq({name: 'kermit', age: 33}, Frog.evaluate(kermit));
    assert.eq({name: 'bermit', age: 37}, Frog.evaluate(bermit));
  }
);


test(
  'Immutable2EqsTest',

  [
    'ephox.katamari.data.Immutable2'
  ],

  function (Immutable2) {

    var konst = function(x) {
      return function() {
        return x;
      };
    };

    var thunkEq = function(a, b) {
      return a() === b();
    };

    var roundedEq = function(a, b) {
      return Math.round(a) === Math.round(b);
    };

    var Frog = Immutable2.product(
      ['name', 'age', 'shirtSize'],
      [thunkEq, roundedEq]
    );
    var kermit = Frog.nu(konst('kermit'), 33.2, "huge");
    var bermit = Frog.nu(konst('bermit'), 33.7, "huuuuuuuge");

    assert.eq('kermit', kermit.name()());
    assert.eq(33.2, kermit.age());
    assert.eq(true, Frog.eq(kermit, kermit));
    assert.eq(false, Frog.eq(kermit, bermit));


    assert.eq('kermit', Frog.evaluate(kermit).name());
    assert.eq(33.2, Frog.evaluate(kermit).age);
  }
);
test(
  'SplitTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.ghetto.split.GhettoSplit'
  ],

  function (Gene, TestUniverse, TextGene, Fun, Option, GhettoSplit) {
    var generate = function (text) {
      var universe = TestUniverse(
        Gene('root', 'root', [
          TextGene('generate_text', text)
        ])
      );

      var item = universe.find(universe.get(), 'generate_text').getOrDie();
      return {
        universe: universe,
        item: item
      };
    };

    var isEq = function (opt1, opt2) {
      return opt1.fold(function () {
        return opt2.isNone();
      }, function (a) {
        return opt2.exists(function (x) {
          return a === x.text;
        });
      });
    };

    var checkSplit = function (before, after, text, position) {
      var input = generate(text);
      var actual = GhettoSplit.split(input.universe, input.item, position);
      assert.eq(true, isEq(before, actual.before()));
      assert.eq(true, isEq(after, actual.after()));
    };

    var checkPair = function (expected, middle, text, start, finish) {
      var input = generate(text);
      var actual = GhettoSplit.splitByPair(input.universe, input.item, start, finish);
      assert.eq(middle, actual.text);
      assert.eq(expected, input.universe.shortlog(function (item) {
        return item.name === 'TEXT_GENE' ? 'text("' + item.text + '")' : item.id;
      }));
    };

    var tryCheck = function (expected, fail, f) {
      try {
        f();
        assert.fail(fail);
      } catch (err) {
        assert.eq(expected, err);
      }
    };

    checkSplit(Option.some('a '), Option.some('cat'), 'a cat', 2);
    checkSplit(Option.none(), Option.some('apple'), 'apple', 0);
    checkSplit(Option.some('car'), Option.some('t'), 'cart', 3);
    checkSplit(Option.some('cart'), Option.none(), 'cart', 4);

    checkPair('root(text("apples"))', 'apples', 'apples', 0, 0);
    checkPair('root(text("apples"))', 'apples', 'apples', 0, 6);
    tryCheck('Invalid split operation. Value for start (1) must be lower than end (0)', 'Expected error', function () {
      checkPair('root(text("apples"))', 'apples', 'apples', 1, 0);
    });
    checkPair('root(text("apple"),text("s"))', 'apple', 'apples', 0, 5);
    checkPair('root(text("a"),text("ppl"),text("es"))', 'ppl', 'apples', 1, 4);
    checkPair('root(text("app"),text("les"))', 'les', 'apples', 3, 6);
  }
);

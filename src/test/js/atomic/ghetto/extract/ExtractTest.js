test(
  'ExtractTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.phoenix.ghetto.extract.GhettoExtract'
  ],

  function (Gene, TestUniverse, TextGene, Arr, GhettoExtract) {

    var doc = TestUniverse(
      Gene('root', 'root', [
        Gene('1', 'div', [
          Gene('1.1', 'p', [
            Gene('1.1.1', 'img', [])
          ]),
          Gene('1.2', 'p', [
            TextGene('1.2.1', 'This is text'),
            Gene('1.2.2', 'span', [
              TextGene('1.2.2.1', 'inside a span')
            ])
          ])
        ])
      ])
    );

    var check = function (expected, extract, initial) {
      var start = doc.find(doc.get(), initial).getOrDie();
      var actual = extract(doc, start);
      assert.eq(expected, Arr.map(actual, function (a) {
        return a.fold(function (item) {
          return 'boundary(' + item.id + ')';
        }, function (item) {
          return 'empty(' + item.id + ')';
        }, function (item) {
          return 'text("' + item.text + '")';
        });
      }));
    };

    var checkFrom = function (expected, initial) {
      check(expected, GhettoExtract.typed, initial);
    };

    var checkAll = function (expected, initial) {
      var start = doc.find(doc.get(), initial).getOrDie();
      var actual = GhettoExtract.items(doc, start);
      assert.eq(expected, Arr.map(actual, function (a) {
        return a.id;
      }));
    };

    checkFrom([
      'boundary(1)',
      'boundary(1.1)',
      'empty(1.1.1)',
      'boundary(1.1)',
      'boundary(1.2)',
      'text("This is text")',
      'text("inside a span")',
      'boundary(1.2)',
      'boundary(1)'
    ], 'root');

    checkAll([
      '1', '1.1', '1.1.1', '1.1', '1.2', '1.2.1', '1.2.2.1', '1.2', '1'
    ], 'root');
  }
);

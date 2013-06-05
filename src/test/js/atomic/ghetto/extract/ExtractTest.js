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

    //
    // var extract = function (universe, child, offset) {
    var checkExtract = function (expected, childId, offset) {
      var child = doc.find(doc.get(), childId).getOrDie();
      var actual = GhettoExtract.extract(doc, child, offset);
      assert.eq(expected.id, actual.element().id);
      assert.eq(expected.offset, actual.offset());
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

    checkExtract({ id: '1.2.2', offset: 3 }, '1.2.2.1', 3);
  }
);

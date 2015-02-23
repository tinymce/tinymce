test(
  'ClumpsTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.robin.clumps.Clumps'
  ],

  function (Gene, TestUniverse, TextGene, Arr, Clumps) {
    var doc = TestUniverse(Gene('root', 'root', [
      Gene('p1', 'p', [
        Gene('aa', 'span', [
          TextGene('aaa', 'aaa'),
          TextGene('aab', 'aab'),
          TextGene('aac', 'aac')
        ])
      ])
    ]));
 
 
    var isRoot = function (item) {
      return item.name === 'root';
    };

       //var collect = function (universe, isRoot, start, soffset, finish, foffset)
    var check = function (expected, startId, soffset, finishId, foffset) {
      var start = doc.find(doc.get(), startId).getOrDie();
      var finish = doc.find(doc.get(), finishId).getOrDie();
      var rawActual = Clumps.collect(doc, isRoot, start, soffset, finish, foffset);
      
      var actual = Arr.map(rawActual, function (a) {
        return { start: a.start().id, soffset: a.soffset(), finish: a.finish().id, foffset: a.foffset() };
      });

      assert.eq(expected, actual);
    };

    check([
      { start: 'aaa', soffset: 0, finish: 'aac', foffset: 'aac'.length }
    ], 'p1', 0, 'p1', 1);
  }
);
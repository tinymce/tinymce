test(
  'HackPathsTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.phoenix.gather.HackPaths',
    'ephox.phoenix.gather.Hacksy',
    'ephox.phoenix.test.Finder'
  ],

  function (Gene, TestUniverse, TextGene, Arr, HackPaths, Hacksy, Finder) {
    /*
     * <p>
     *   "This is"
     *   "going "
     *   <span>
     *     "to"
     *     <b>
     *       " b"
     *     </b>
     *     "e"
     *     "more"
     *   <span>
     * </p>
     * <p>
     *   "th"
     *   "a"
     *   "n"
     *   "one "
     *   <i>
     *     "para"
     *     "graph"
     *   </i>
     * </p>
     */
    var universe = TestUniverse(
      Gene('root', 'root', [
        Gene('p1', 'p', [
          TextGene('this_is_', 'This is '),
          TextGene('going_', 'going '),
          Gene('s1', 'span', [
            TextGene('to', 'to'),
            Gene('b1', 'b', [
              TextGene('_b', ' b' )
            ]),
            TextGene('e', 'e'),
            TextGene('_more', ' more')
          ])
        ]),
        Gene('p2', 'p', [
          TextGene('th', 'th'),
          TextGene('a', 'a'),
          TextGene('n', 'n'),
          TextGene('one_', 'one '),
          Gene('i1', 'i', [
            TextGene('para', 'para'),
            TextGene('graph', 'graph')
          ])
        ])
      ])
    );


    var checkPath = function (expected, id, direction) {
      var act = HackPaths.words(universe, Finder.get(universe, id), direction);
      assert.eq(expected, Arr.map(act, function (a) {
        var text = universe.property().getText(a.item());
        return text.substring(a.start(), a.finish());
      }));
    };

    checkPath([ 'This is ', 'going' ], 'this_is_');
    checkPath([ 'to' ], 'to');
    checkPath([ 'going ', 'to' ], 'going_');
  }
);
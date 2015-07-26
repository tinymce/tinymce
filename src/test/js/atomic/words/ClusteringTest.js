test(
  'ClusteringTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.robin.words.Clustering'
  ],

  function (Gene, TestUniverse, TextGene, Arr, Fun, Clustering) {
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
     * <p>
     *   <span>
     *     <span>
     *       <span>
     *         "end"
     *       </span>
     *     </span>
     *   </span>
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
        ]),
        Gene('p3', 'p', [
          Gene('p3s1', 'span', [
            Gene('p3s2', 'span', [
              Gene('p3s3', 'span', [
                TextGene('end', 'end')
              ])
            ])
          ])
        ])
      ])
    );


    var checkPath = function (expected, id) {
      var act = Clustering.words(universe, universe.find(universe.get(), id).getOrDie(), Fun.constant(false)).all();
      assert.eq(expected, Arr.map(act, function (a) {
        var text = universe.property().getText(a.item());
        return text.substring(a.start(), a.finish());
      }));
    };

    checkPath([ 'This is ', 'going' ], 'this_is_');
    checkPath([ 'to' ], 'to');
    checkPath([ 'going ', 'to' ], 'going_');
    checkPath([ 'end' ], 'end')
  }
);
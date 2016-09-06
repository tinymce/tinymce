test(
  'ClusteringTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.words.Clustering'
  ],

  function (Gene, TestUniverse, TextGene, Arr, Fun, Option, Clustering) {

    var checkWords  = function (universe, words) {
      return Arr.map(words, function (a) {
        var text = universe.property().getText(a.item());
        return text.substring(a.start(), a.finish());
      });
    };

    var checkAll = function (universe, expLeft, expMiddle, expRight, expLang, id) {
      var act = Clustering.words(universe, universe.find(universe.get(), id).getOrDie(), Fun.constant(false));
      assert.eq(expLeft,   checkWords(universe, act.left()));
      assert.eq(expMiddle, checkWords(universe, act.middle()));
      assert.eq(expRight,  checkWords(universe, act.right()));
      assert.eq(true, Option.equals(expLang, act.lang()));
      // .all() is:  tfel + middle + right
      assert.eq(expLeft.reverse().concat(expMiddle).concat(expRight), checkWords(universe, act.all()));
    };

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
    var uniNoLang = TestUniverse(
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
        // <p id=p3> <span1> "sp"<span2>"l" <span3> "it" "word" </span3> "and" </span2> " not " </span1> " this " </p>
        Gene('p3', 'p', [
          Gene('p3s1', 'span', [
            Gene('p3s2', 'span', [
              Gene('p3s3', 'span', [
                TextGene('end', 'end')
              ])
            ])
          ])
        ]),

        // <p id=p4> <span1> "sp" <span2> "l" <span3> "it" "word" </span3> "and" </span2> " not " </span1> " this " </p>
        Gene('p4', 'p', [
          Gene('p4s1', 'span', [
            TextGene('p4sp', 'sp'),
            Gene('p4s2', 'span', [
              TextGene('p4l', 'l'),
              Gene('p4s3', 'span', [
                TextGene('p4it', 'it'),
                TextGene('p4word', 'word')
              ]),
              TextGene('p4and', 'and')
            ]),
            TextGene('p4_not_', ' not ')
          ]),
          TextGene('p4_this_', ' this ')
        ])
      ]) // root
    );

    // 26=middle, 28=lang

    // <p id=p1> "This is " "going " <span> "to" <b> " b" </b> "e" " more" <span> </p>
    checkAll(uniNoLang, [], [ 'This is ', 'going ', 'to', ' b', 'e', ' more'], [], Option.none(), 'p1'); // all inside p1
    checkAll(uniNoLang, [], [ 'This is '], ['going' ], Option.none(), 'this_is_'); // right is text sibling
    checkAll(uniNoLang, [], [ 'going '], ['to'], Option.none(), 'going_'); // right is element sibling text
    checkAll(uniNoLang, [], [ 'to', ' b', 'e', ' more' ], [], Option.none(), 's1'); // all inside s1 ('going ' on left has a space at the end)
    checkAll(uniNoLang, [], [ 'to' ], [], Option.none(), 'to'); // words each side of 'to' have spaces
    checkAll(uniNoLang, ['to'], [ ' b' ], ['e'], Option.none(), 'b1'); // words each side of b1
    checkAll(uniNoLang, ['to'], [ ' b' ], ['e'], Option.none(), '_b'); // words each side of ' b'
    checkAll(uniNoLang, ['b'], ['e'], [], Option.none(), 'e'); // 'be' is split by b1

    // <p id=p2> "th" "a" "n" "one " <i> "para" "graph" </i> </p>
    checkAll(uniNoLang, [], ['th', 'a', 'n', 'one ', 'para', 'graph'], [], Option.none(), 'p2'); // all inside p2
    checkAll(uniNoLang, [], ['th' ], ['a', 'n', 'one'], Option.none(), 'th'); // right sibling text up to i1
    checkAll(uniNoLang, ['th'], ['a' ], ['n', 'one'], Option.none(), 'a'); // left is sibling text, right is sibling text
    checkAll(uniNoLang, ['a', 'th'], ['n' ], ['one'], Option.none(), 'n'); // left is sibling text, right is sibling text
    checkAll(uniNoLang, ['n', 'a', 'th'], [ 'one ' ], ['para', 'graph'], Option.none(), 'one_');
    checkAll(uniNoLang, [], ['para', 'graph'], [], Option.none(), 'i1'); // all inside i1
    checkAll(uniNoLang, [], [ 'para' ], ['graph'], Option.none(), 'para'); // right is sibling text
    checkAll(uniNoLang, ['para'], [ 'graph' ], [], Option.none(), 'graph'); // left is sibling text 

    // <p id=p3> <span> <span> <span> "end" </span> </span> </span> </p>
    checkAll(uniNoLang, [], [ 'end' ], [], Option.none(), 'p3');
    checkAll(uniNoLang, [], [ 'end' ], [], Option.none(), 'p3s1');
    checkAll(uniNoLang, [], [ 'end' ], [], Option.none(), 'p3s2');
    checkAll(uniNoLang, [], [ 'end' ], [], Option.none(), 'p3s3');
    checkAll(uniNoLang, [], [ 'end' ], [], Option.none(), 'end');

    // <p id=p4> <span1> "sp" <span2> "l" <span3> "it" "word" </span3> "and" </span2> " not " </span1> " this " </p>
    checkAll(uniNoLang, [], [ 'sp', 'l', 'it', 'word', 'and', ' not ', ' this ' ], [], Option.none(), 'p4');
    checkAll(uniNoLang, [], [ 'sp', 'l', 'it', 'word', 'and', ' not '], [], Option.none(), 'p4s1');
    checkAll(uniNoLang, [], [ 'sp'], ['l', 'it', 'word', 'and'], Option.none(), 'p4sp'); // right is text nodes without spaces
    checkAll(uniNoLang, ['sp'], ['l', 'it', 'word', 'and'], [], Option.none(), 'p4s2'); // left is text nodes without spaces
    checkAll(uniNoLang, ['sp'], ['l'], ['it', 'word', 'and'], Option.none(), 'p4l'); // left/right are text nodes without spaces
    checkAll(uniNoLang, ['l', 'sp'], ['it','word'], ['and'], Option.none(), 'p4s3'); // left/right are text nodes without spaces
    checkAll(uniNoLang, ['l', 'sp'], ['it'], ['word', 'and'], Option.none(), 'p4it'); // left/right are text nodes without spaces
    checkAll(uniNoLang, ['it', 'l', 'sp'], ['word'], ['and'], Option.none(), 'p4word'); // left/right are text nodes without spaces
    checkAll(uniNoLang, ['word', 'it', 'l', 'sp'], ['and'], [], Option.none(), 'p4and'); // left/right are text nodes without spaces
    // NOTE: next line looks like a bug? 
    // ' not ' has a space either side of the word, so dont need to expand left?
    // - compare the line after, it doesent capture the not to the left 
    checkAll(uniNoLang, ['and', 'word', 'it', 'l', 'sp'], [' not '], [], Option.none(), 'p4_not_'); // left is a sibling word
    checkAll(uniNoLang, [], [' this '], [], Option.none(), 'p4_this_'); 

    // //////////////////////////
    // Universe with NO ROOT LANG

    // //////////////////////////
    // Universe WITH ROOT LANG

  }
);
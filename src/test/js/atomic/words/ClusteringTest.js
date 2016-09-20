test(
  'ClusteringTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.words.Clustering'
  ],

  function (RawAssertions, Gene, TestUniverse, TextGene, Arr, Fun, Option, Clustering) {

    var checkLang  = function (universe, id, lang) {
      var item = universe.find(universe.get(), id).getOrDie();
      var itemLang = Clustering.language(universe, item);
      RawAssertions.assertEq('check lang()', true, Option.equals(lang, itemLang));
    };

    var checkWords  = function (universe, words) {
      return Arr.map(words, function (a) {
        var text = universe.property().getText(a.item());
        return text.substring(a.start(), a.finish());
      });
    };

    var checkAll = function (universe, expLeft, expMiddle, expRight, expLang, id) {
      var act = Clustering.words(universe, universe.find(universe.get(), id).getOrDie(), Fun.constant(false));
      RawAssertions.assertEq('check left()', expLeft,   checkWords(universe, act.left()));
      RawAssertions.assertEq('check middle()', expMiddle, checkWords(universe, act.middle()));
      RawAssertions.assertEq('check right()', expRight,  checkWords(universe, act.right()));
      RawAssertions.assertEq('check lang()', true, Option.equals(expLang, act.lang()));
      // .all() is:  tfel + middle + right
      RawAssertions.assertEq('check all()', expLeft.reverse().concat(expMiddle).concat(expRight), checkWords(universe, act.all()));
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
    // NOTE: next line looks wrong? 
    // ' not ' has a space either side of the word, so dont need to expand left?
    // - compare the line after, it doesent capture the not to the left 
    checkAll(uniNoLang, ['and', 'word', 'it', 'l', 'sp'], [' not '], [], Option.none(), 'p4_not_'); // left is a sibling word
    checkAll(uniNoLang, [], [' this '], [], Option.none(), 'p4_this_'); 

    // //////////////////////////////////////
    // LANG Attr + Universe with NO ROOT LANG
    var uniSpanLang = TestUniverse(
      Gene('root', 'root', [
        // <p id=p1> <span1> "sp" <span2> "l" <span3 lang=FR> "it" "word" </span3> "and" </span2> " not " </span1> " this " </p>
        Gene('p1', 'p', [
          Gene('p1s1', 'span', [
            TextGene('p1sp', 'sp'),
            Gene('p1s2', 'span', [
              TextGene('p1l', 'l'),
              Gene('p1s3', 'span', [
                TextGene('p1it', 'it'),
                TextGene('p1word', 'word')
              ], {}, {'lang': 'FR'}),
              TextGene('p1and', 'and')
            ]),
            TextGene('p1_not_', ' not ')
          ]),
          TextGene('p1_this_', ' this ')
        ]),
        // <p id=p2 lang=DE> <span1> "sp" <span2> "l" <span3> "it" "word" </span3> "and" </span2> " not " </span1> " this " </p>
        Gene('p2', 'p', [
          Gene('p2s1', 'span', [
            TextGene('p2sp', 'sp'),
            Gene('p2s2', 'span', [
              TextGene('p2l', 'l'),
              Gene('p2s3', 'span', [
                TextGene('p2it', 'it'),
                TextGene('p2word', 'word')
              ]),
              TextGene('p2and', 'and')
            ]),
            TextGene('p2_not_', ' not ')
          ]),
          TextGene('p2_this_', ' this ')
        ], {}, {'lang': 'DE'}),
        // <p id=p3 lang=DE> <span1> "sp" <span2> "l" <span3 lang=FR> "it" "word" </span3> "and" </span2> " not " </span1> " this " </p>
        Gene('p3', 'p', [
          Gene('p3s1', 'span', [
            TextGene('p3sp', 'sp'),
            Gene('p3s2', 'span', [
              TextGene('p3l', 'l'),
              Gene('p3s3', 'span', [
                TextGene('p3it', 'it'),
                TextGene('p3word', 'word')
              ], {}, {'lang': 'FR'}),
              TextGene('p3and', 'and')
            ]),
            TextGene('p3_not_', ' not ')
          ]),
          TextGene('p3_this_', ' this ')
        ], {}, {'lang': 'DE'})
      ]) // root
    );

    checkLang(uniSpanLang, 'p1',   Option.none());
    checkLang(uniSpanLang, 'p1s1', Option.none());
    checkLang(uniSpanLang, 'p1s2', Option.none());
    checkLang(uniSpanLang, 'p1s3', Option.some('FR'));
    checkLang(uniSpanLang, 'p2',   Option.some('DE'));
    checkLang(uniSpanLang, 'p2s1', Option.some('DE'));
    checkLang(uniSpanLang, 'p2s2', Option.some('DE'));
    checkLang(uniSpanLang, 'p2s3', Option.some('DE'));
    checkLang(uniSpanLang, 'p3',   Option.some('DE'));
    checkLang(uniSpanLang, 'p3s1', Option.some('DE'));
    checkLang(uniSpanLang, 'p3s2', Option.some('DE'));
    checkLang(uniSpanLang, 'p3s3', Option.some('FR'));

    // TODO: Part of TBIO-470: fix known multi-language problem where we currently assume the 'middle' text is all one langugae. 
    //       We should check the language of sub-elements, but this requires changes to TypedNode. 

    // <p id=p1> <span1> "sp" <span2> "l" <span3 lang=FR> "it" "word" </span3> "and" </span2> " not " </span1> " this " </p>

    // Should be: checkAll(uniSpanLang, [], [ 'sp', 'l', 'and', ' not ', ' this ' ], [], Option.none(), 'p1');
    checkAll(uniSpanLang, [], [ 'sp', 'l', 'it', 'word', 'and', ' not ', ' this ' ], [], Option.none(), 'p1');
    // Sholud be: checkAll(uniSpanLang, [], [ 'sp', 'l', 'and', ' not '], [], Option.none(), 'p1s1');
    checkAll(uniSpanLang, [], [ 'sp', 'l', 'it', 'word', 'and', ' not '], [], Option.none(), 'p1s1');
    // Should be: checkAll(uniSpanLang, [], [ 'sp'], ['l', 'and'], Option.none(), 'p1sp');
    checkAll(uniSpanLang, [], [ 'sp'], ['l'/*, 'it', 'word', 'and' */], Option.none(), 'p1sp');
    // Should be: checkAll(uniSpanLang, ['sp'], ['l', 'and'], [], Option.none(), 'p1s2');
    checkAll(uniSpanLang, ['sp'], ['l', 'it', 'word', 'and'], [], Option.none(), 'p1s2');
    // Should be: checkAll(uniSpanLang, ['sp'], ['l'], ['and'], Option.none(), 'p1l'); 
    checkAll(uniSpanLang, ['sp'], ['l'], [ /*'it', 'word', 'and' */], Option.none(), 'p1l');     
    // Should be: checkAll(uniSpanLang, ['l', 'sp'], [], ['and'], Option.none(), 'p1s3');
    checkAll(uniSpanLang, ['l', 'sp'], ['it','word'], ['and'], Option.some('FR'), 'p1s3');
    // OK:
    checkAll(uniSpanLang, [], ['it'], ['word'], Option.some('FR'), 'p1it');
    checkAll(uniSpanLang, ['it'], ['word'], [], Option.some('FR'), 'p1word');
    // Should be: checkAll(uniSpanLang, [], ['and'], [], Option.none(), 'p1and');
    checkAll(uniSpanLang, ['word', 'it', 'l', 'sp'], ['and'], [], Option.none(), 'p1and');
    // Should be: checkAll(uniSpanLang, ['and'], [' not '], [], Option.none(), 'p1_not_');
    checkAll(uniSpanLang, ['and', 'word', 'it', 'l', 'sp'], [' not '], [], Option.none(), 'p1_not_');
    // OK
    checkAll(uniSpanLang, [], [' this '], [], Option.none(), 'p1_this_'); 

    // <p id=p2> <span1 lang=DE> "sp" <span2> "l" <span3> "it" "word" </span3> "and" </span2> " not " </span1> " this " </p>
    // same as p4 in first example, but with lang=DE, not None
    checkAll(uniSpanLang, [], [ 'sp', 'l', 'it', 'word', 'and', ' not ', ' this ' ], [], Option.some('DE'), 'p2');
    checkAll(uniSpanLang, [], [ 'sp', 'l', 'it', 'word', 'and', ' not '], [], Option.some('DE'), 'p2s1');
    checkAll(uniSpanLang, [], [ 'sp'], ['l', 'it', 'word', 'and'], Option.some('DE'), 'p2sp');
    checkAll(uniSpanLang, ['sp'], ['l', 'it', 'word', 'and'], [], Option.some('DE'), 'p2s2');
    checkAll(uniSpanLang, ['sp'], ['l'], ['it', 'word', 'and'], Option.some('DE'), 'p2l');
    checkAll(uniSpanLang, ['l', 'sp'], ['it','word'], ['and'], Option.some('DE'), 'p2s3');
    checkAll(uniSpanLang, ['l', 'sp'], ['it'], ['word', 'and'], Option.some('DE'), 'p2it');
    checkAll(uniSpanLang, ['it', 'l', 'sp'], ['word'], ['and'], Option.some('DE'), 'p2word');
    checkAll(uniSpanLang, ['word', 'it', 'l', 'sp'], ['and'], [], Option.some('DE'), 'p2and');
    // NOTE: next line looks wrong? 
    // ' not ' has a space either side of the word, so dont need to expand left?
    // - compare the line after, it doesent capture the not to the left 
    checkAll(uniSpanLang, ['and', 'word', 'it', 'l', 'sp'], [' not '], [], Option.some('DE'), 'p2_not_');
    checkAll(uniSpanLang, [], [' this '], [], Option.some('DE'), 'p2_this_'); 

    // <p id=p3 lang=DE> <span1> "sp" <span2> "l" <span3 lang=FR> "it" "word" </span3> "and" </span2> " not " </span1> " this " </p>
    // checkAll(uniSpanLang, [], [ 'sp', 'l', 'and', ' not ', ' this ' ], [], Option.some('DE'), 'p3');
    checkAll(uniSpanLang, [], [ 'sp', 'l', 'it', 'word', 'and', ' not ', ' this ' ], [], Option.some('DE'), 'p3');
    // Should be: checkAll(uniSpanLang, [], [ 'sp', 'l', 'and', ' not '], [], Option.some('DE'), 'p3s1');
    checkAll(uniSpanLang, [], [ 'sp', 'l', 'it', 'word', 'and', ' not '], [], Option.some('DE'), 'p3s1');
    // Should be: checkAll(uniSpanLang, [], [ 'sp'], ['l', 'and'], Option.some('DE'), 'p3sp');
    checkAll(uniSpanLang, [], [ 'sp'], ['l', 'it', 'word', 'and'], Option.some('DE'), 'p3sp');
    // Should be: checkAll(uniSpanLang, ['sp'], ['l', 'and'], [], Option.some('DE'), 'p3s2');
    checkAll(uniSpanLang, ['sp'], ['l', 'it', 'word', 'and'], [], Option.some('DE'), 'p3s2');
    // Should be: checkAll(uniSpanLang, ['sp'], ['l'], ['and'], Option.some('DE'), 'p3l');
    checkAll(uniSpanLang, ['sp'], ['l'], ['it', 'word', 'and'], Option.some('DE'), 'p3l');
    // Should be: checkAll(uniSpanLang, [], ['it','word'], [], Option.some('FR'), 'p3s3');
    checkAll(uniSpanLang, ['l', 'sp'], ['it','word'], ['and'], Option.some('FR'), 'p3s3');
    // OK:
    checkAll(uniSpanLang, [], ['it'], ['word'], Option.some('FR'), 'p3it');
    checkAll(uniSpanLang, ['it'], ['word'], [], Option.some('FR'), 'p3word');
    // Should be: checkAll(uniSpanLang, ['l', 'sp'], ['and'], [], Option.some('DE'), 'p3and');
    checkAll(uniSpanLang, ['word', 'it', 'l', 'sp'], ['and'], [], Option.some('DE'), 'p3and');
    // // NOTE: next line looks wrong? 
    // // ' not ' has a space either side of the word, so dont need to expand left?
    // // - compare the line after, it doesent capture the not to the left 
    // Should be: checkAll(uniSpanLang, ['and', 'l', 'sp'], [' not '], [], Option.some('DE'), 'p3_not_');
    checkAll(uniSpanLang, ['and', 'word', 'it', 'l', 'sp'], [' not '], [], Option.some('DE'), 'p3_not_');
    checkAll(uniSpanLang, [], [' this '], [], Option.some('DE'), 'p3_this_'); 

    // //////////////////////////////////////
    // LANG Attr + Universe WITH ROOT LANG
    var uniLangSpanLang = TestUniverse(
      Gene('root', 'root', [
        // <p id=p1> <span1> "sp" <span2> "l" <span3 lang=FR> "it" "word" </span3> "and" </span2> " not " </span1> " this " </p>
        Gene('p1', 'p', [
          Gene('p1s1', 'span', [
            TextGene('p1sp', 'sp'),
            Gene('p1s2', 'span', [
              TextGene('p1l', 'l'),
              Gene('p1s3', 'span', [
                TextGene('p1it', 'it'),
                TextGene('p1word', 'word')
              ], {}, {'lang': 'FR'}),
              TextGene('p1and', 'and')
            ]),
            TextGene('p1_not_', ' not ')
          ]),
          TextGene('p1_this_', ' this ')
        ])
      ], {}, {'lang': 'DE'}) // root
    );

    // doc default = DE, span = FR: Should be same result as p3 in uniSpanLang above 
    // Root=DE <p id=p1> <span1> "sp" <span2> "l" <span3 lang=FR> "it" "word" </span3> "and" </span2> " not " </span1> " this " </p>
    // checkAll(uniLangSpanLang, [], [ 'sp', 'l', 'and', ' not ', ' this ' ], [], Option.some('DE'), 'p1');
    checkAll(uniLangSpanLang, [], [ 'sp', 'l', 'it', 'word', 'and', ' not ', ' this ' ], [], Option.some('DE'), 'p1');
    // Should be: checkAll(uniLangSpanLang, [], [ 'sp', 'l', 'and', ' not '], [], Option.some('DE'), 'p1s1');
    checkAll(uniLangSpanLang, [], [ 'sp', 'l', 'it', 'word', 'and', ' not '], [], Option.some('DE'), 'p1s1');
    // Should be: checkAll(uniLangSpanLang, [], [ 'sp'], ['l', 'and'], Option.some('DE'), 'p1sp');
    checkAll(uniLangSpanLang, [], [ 'sp'], ['l', 'it', 'word', 'and'], Option.some('DE'), 'p1sp');
    // Should be: checkAll(uniLangSpanLang, ['sp'], ['l', 'and'], [], Option.some('DE'), 'p1s2');
    checkAll(uniLangSpanLang, ['sp'], ['l', 'it', 'word', 'and'], [], Option.some('DE'), 'p1s2');
    // Should be: checkAll(uniLangSpanLang, ['sp'], ['l'], ['and'], Option.some('DE'), 'p1l');
    checkAll(uniLangSpanLang, ['sp'], ['l'], ['it', 'word', 'and'], Option.some('DE'), 'p1l');
    // Should be: checkAll(uniLangSpanLang, [], ['it','word'], [], Option.some('FR'), 'p1s3');
    checkAll(uniLangSpanLang, ['l', 'sp'], ['it','word'], ['and'], Option.some('FR'), 'p1s3');
    // OK:
    checkAll(uniLangSpanLang, [], ['it'], ['word'], Option.some('FR'), 'p1it');
    checkAll(uniLangSpanLang, ['it'], ['word'], [], Option.some('FR'), 'p1word');
    // Should be: checkAll(uniLangSpanLang, ['l', 'sp'], ['and'], [], Option.some('DE'), 'p1and');
    checkAll(uniLangSpanLang, ['word', 'it', 'l', 'sp'], ['and'], [], Option.some('DE'), 'p1and');
    // // NOTE: next line looks wrong? 
    // // ' not ' has a space either side of the word, so dont need to expand left?
    // // - compare the line after, it doesent capture the not to the left 
    // Should be: checkAll(uniLangSpanLang, ['and', 'l', 'sp'], [' not '], [], Option.some('DE'), 'p1_not_');
    checkAll(uniLangSpanLang, ['and', 'word', 'it', 'l', 'sp'], [' not '], [], Option.some('DE'), 'p1_not_');
    checkAll(uniLangSpanLang, [], [' this '], [], Option.some('DE'), 'p1_this_'); 

  }
);
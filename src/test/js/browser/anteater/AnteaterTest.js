test(
  'AnteaterTest',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.robin.anteater.Anteater',
    'ephox.robin.anteater.Placid',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Hierarchy',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll'
  ],

  function (DomUniverse, Obj, Fun, Anteater, Placid, Body, Compare, Element, Hierarchy, Html, Insert, InsertAll) {
    var body = Body.body();

    var container = Element.fromTag('div');
    var reset = function () {
      container.dom().innerHTML =
        '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
        '<p>And another <u>paragraph</u></p>' +
        '<p>Plus one more.</p>' +
        '<p>Last one, I promise</p>';
    };

    Insert.append(body, container);


    var check = function () {
      reset();
    };

    reset();

    var find = function (path) {
      return Hierarchy.follow(container, path).getOrDie('Could not find the path: ' + path.join(','));
    };

    var paths = {
      p1: [ 0 ],
      p1FirstText: [ 0, 0 ],
      bold: [ 0, 1 ],
      boldWord: [ 0, 1, 0 ],
      p1MiddleText: [ 0, 2 ],
      italic: [ 0, 3 ],
      italicWord: [ 0, 3, 0 ],
      p1LastText: [ 0, 4 ],
      p2: [ 1 ],
      p2Text: [ 1, 0 ],
      underline: [ 1, 1 ],
      underlineWord: [ 1, 1, 0 ],
      p3: [ 2 ],
      p3Text: [ 2, 0 ],
      p4: [ 3 ],
      p4Text: [ 3, 0 ]
    };

    var isRoot = Fun.curry(Compare.eq, container);

    var mark = function (result) {
      result.each(function (res) {
        if (res.length > 0) {
          var strong = Element.fromTag('strong');
          console.log('res: ', res);
          Insert.before(res[0], strong);
          InsertAll.append(strong, res);
        }
      });
    };

    // Obj.each(paths, function (path, value) {
    //   console.log('path of: ' + value, path, find(path).dom());
    // });
    // console.log('start: ', Hierarchy.follow(container, [ 0, 1, 0 ]).getOrDie().dom());
    var check = function (expected, start, soffset, finish, foffset) {
      var actual = Placid.placid(DomUniverse(), isRoot, find(start), soffset, find(finish), foffset);
      console.log('placid.done');
      mark(actual);
      assert.eq(expected, Html.get(container));
    };

    // check(
    //   '<p>This is <b>the word</b> that I can understand, even if <strong><i>it</i> is not the same as before</p>' +
    //   '<p>And another <u>paragraph</u></strong></p>' +
    //   '<p>Plus one more.</p>' +
    //   '<p>Last one, I promise</p>', paths.p1, paths.underline
    // );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      '<p>This<strong> is <b>bold text</b> an</strong>d <i>italic text</i> here.</p>',
      [ 0, 0 ], 'This'.length, [ 0, 2 ], ' an'.length
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      '<p>This is <strong><b>bold text</b></strong> and <i>italic text</i> here.</p>',
      [ 0 ], 1, [ 0 ], 2
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      '<p>This is <strong><b>bold text</b></strong> and <i>italic text</i> here.</p>',
      [ 0 ], 1, [ 0, 1 ], 1
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      '<p>This is <b><strong>bold</strong> text</b> and <i>italic text</i> here.</p>',
      [ 0 ], 1, [ 0, 1, 0 ], 'bold'.length
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      '<p>T<strong>his is <b>bold</b></strong><b> text</b> and <i>italic text</i> here.</p>',
      [ 0, 0 ], 'T'.length, [ 0, 1, 0 ], 'bold'.length
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      '<p>This is <b>bold text</b><strong> and </strong><i>italic text</i> here.</p>',
      [ 0 ], 2, [ 0 ], 3
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      '<p>This is <b>bold text</b> and <strong><i>italic text</i></strong> here.</p>',
      [ 0 ], 3, [ 0 ], 4
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      '<p>This is <b>bold text</b> and <i>italic text</i><strong> here.</strong></p>',
      [ 0 ], 4, [ 0 ], 5
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      '<p>This is <b>bold text</b> and <i>italic text</i><strong> he</strong>re.</p>',
      [ 0 ], 4, [ 0, 4 ], ' he'.length
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      '<p>This is <b>b</b><strong><b>old text</b> and <i>italic text</i> he</strong>re.</p>',
      [ 0, 1, 0 ], 'b'.length, [ 0, 4 ], ' he'.length
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      '<p>This is <b>b<strong>o</strong>ld text</b> and <i>italic text</i> here.</p>',
      [ 0, 1, 0 ], 'b'.length, [ 0, 1, 0 ], 'bo'.length
    );

    // Bring this back

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      '<p>This is <b>bold text</b><strong> and </strong><i>italic text</i> here.</p>',
      [ 0, 1 ], 1, [ 0, 3 ], 0
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      // Remove the empty formatting element.
      '<p>This is <b></b><strong><b>bold text</b> a</strong>nd <i>italic text</i> here.</p>',
      [ 0, 1, 0 ], ''.length, [ 0, 2 ], ' a'.length
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      '<p>This is <b><strong>bold text</strong></b> and <i>italic text</i> here.</p>',
      [ 0, 1, 0 ], ''.length, [ 0, 1, 0 ], 'bold text'.length
    );

    console.log('LAST');
    container.dom().innerHTML = '<p>This <span>new <u>words</u></span> is <b>bold text</b> and <i>italic text</i> here.</p>';
    check(
      '<p>This <span>new <u>words</u></span><strong> is <b>bo</b></strong><b>ld text</b> and <i>italic text</i> here.</p>',
      [ 0, 1 ], 2, [ 0, 3, 0 ], 'bo'.length
    );


    /*
    var reset = function () {
      container.dom().innerHTML =
        '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
        '<p>And another <u>paragraph</u></p>' +
        '<p>Plus one more.</p>' +
        '<p>Last one, I promise</p>';
    };
    */

  }
);
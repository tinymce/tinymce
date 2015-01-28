test(
  'clumps :: discover',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.robin.api.dom.DomClumps',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Hierarchy',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll'
  ],

  function (Arr, Fun, DomClumps, Body, Compare, Element, Hierarchy, Html, Insert, InsertAll) {
    var body = Body.body();

    var container = Element.fromTag('div'); 

    Insert.append(body, container);

    var find = function (path) {
      return Hierarchy.follow(container, path).getOrDie('Could not find the path: ' + path.join(','));
    };

    var isRoot = function (elem) {
      return Compare.eq(elem, container);
    };

    var mark = function (result) {
      result.each(function (res) {
        if (res.length > 0) {
          console.log('Things getting wrapped: ', Arr.map(res, function (r) { return r.dom(); }));
          var strong = Element.fromTag('strong');
          Insert.before(res[0], strong);
          InsertAll.append(strong, res);
        }
      });
    };

    var checkFracture = function (expected, start, soffset, finish, foffset) {
      console.log("check.fracture: ", container.dom().innerHTML);
      var premark = DomClumps.fracture(isRoot, {
        start: Fun.constant(find(start)),
        soffset: Fun.constant(soffset),
        finish: Fun.constant(find(finish)),
        foffset: Fun.constant(foffset)
      });
      mark(premark);
      assert.eq(expected, Html.get(container));
    };

    var check = function (expected, start, soffset, finish, foffset) {
      console.log("check.discover: ", container.dom().innerHTML);
      var premark = DomClumps.discover(isRoot, find(start), soffset, find(finish), foffset);
      Arr.each(premark, mark);
      assert.eq(expected, Html.get(container));
    };

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      '<p>This<strong> is <b>bold text</b> an</strong>d <i>italic text</i> here.</p>',
      [ 0, 0 ], 'This'.length, [ 0, 2 ], ' an'.length
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      '<p>This is <strong><b>bold text</b></strong> and <i>italic text</i> here.</p>',
      [ 0 ], 1, [ 0 ], 2
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      '<p>This is <strong><b>bold text</b></strong> and <i>italic text</i> here.</p>',
      [ 0 ], 1, [ 0, 1 ], 1
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      '<p>This is <b><strong>bold</strong> text</b> and <i>italic text</i> here.</p>',
      [ 0 ], 1, [ 0, 1, 0 ], 'bold'.length
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      '<p>T<strong>his is <b>bold</b></strong><b> text</b> and <i>italic text</i> here.</p>',
      [ 0, 0 ], 'T'.length, [ 0, 1, 0 ], 'bold'.length
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      '<p>This is <b>bold text</b><strong> and </strong><i>italic text</i> here.</p>',
      [ 0 ], 2, [ 0 ], 3
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      '<p>This is <b>bold text</b> and <strong><i>italic text</i></strong> here.</p>',
      [ 0 ], 3, [ 0 ], 4
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      '<p>This is <b>bold text</b> and <i>italic text</i><strong> here.</strong></p>',
      [ 0 ], 4, [ 0 ], 5
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      '<p>This is <b>bold text</b> and <i>italic text</i><strong> he</strong>re.</p>',
      [ 0 ], 4, [ 0, 4 ], ' he'.length
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      '<p>This is <b>b</b><strong><b>old text</b> and <i>italic text</i> he</strong>re.</p>',
      [ 0, 1, 0 ], 'b'.length, [ 0, 4 ], ' he'.length
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      '<p>This is <b>b<strong>o</strong>ld text</b> and <i>italic text</i> here.</p>',
      [ 0, 1, 0 ], 'b'.length, [ 0, 1, 0 ], 'bo'.length
    );

    // Bring this back

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      '<p>This is <b>bold text</b><strong> and </strong><i>italic text</i> here.</p>',
      [ 0, 1 ], 1, [ 0, 3 ], 0
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      // Remove the empty formatting element.
      '<p>This is <b></b><strong><b>bold text</b> a</strong>nd <i>italic text</i> here.</p>',
      [ 0, 1, 0 ], ''.length, [ 0, 2 ], ' a'.length
    );

    container.dom().innerHTML = '<p>This is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      '<p>This is <b><strong>bold text</strong></b> and <i>italic text</i> here.</p>',
      [ 0, 1, 0 ], ''.length, [ 0, 1, 0 ], 'bold text'.length
    );

    container.dom().innerHTML = '<p>This <span>new <u>words</u></span> is <b>bold text</b> and <i>italic text</i> here.</p>';
    checkFracture(
      '<p>This <span>new <u>words</u></span><strong> is <b>bo</b></strong><b>ld text</b> and <i>italic text</i> here.</p>',
      [ 0, 1 ], 2, [ 0, 3, 0 ], 'bo'.length
    );

    container.dom().innerHTML =
      '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
      '<p>And another <u>paragraph</u></p>' +
      '<p>Plus one more.</p>' +
      '<p>Last one, I promise</p>';
    check(
      '<p>This is <b>the</b><strong><b> word</b> that I can understand, even if <i>it</i> is not the same as before.</strong></p>' +
      '<p><strong>And another <u>paragraph</u></strong></p>' +
      '<p><strong>Plus one more.</strong></p>' +
      '<p><strong>Last</strong> one, I promise</p>',
      [ 0, 1, 0 ], 'the'.length, [ 3, 0 ], 'Last'.length
    ); 

    container.dom().innerHTML =
      '<p>This is <span>completely <i>different <b>to</b> </i>what you would<span>_expected_</span></span></p>' +
      '<p>And more <u>of this is <span>here</span> again</u>.</p>';
    check(
      '<p>This is <span>completely <i>different <b>t</b></i><strong><i><b>o</b> </i>what you would<span>_expected_</span></strong></span></p>' +
      '<p><strong>And more <u>of this is <span>h</span></u></strong><u><span>ere</span> again</u>.</p>',
      [ 0, 1, 1, 1, 0 ], 't'.length, [ 1, 1, 1, 0 ], 'h'.length
    );
  }
);
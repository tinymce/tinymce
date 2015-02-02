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

    var mark = function (res) {
      if (res.length > 0) {
        var strong = Element.fromTag('strong');
        Insert.before(res[0], strong);
        InsertAll.append(strong, res);
      }
    };

    var checkFracture = function (expected, start, soffset, finish, foffset) {
      DomClumps.fracture(isRoot, find(start), soffset, find(finish), foffset).each(mark);
      assert.eq(expected, Html.get(container));
    };

    var check = function (expected, start, soffset, finish, foffset) {
      var sections = DomClumps.fractures(isRoot, find(start), soffset, find(finish), foffset);
      Arr.each(sections, mark);
      assert.eq(expected, Html.get(container));
    };

    /*
     * Things to check / handle / note:
     *   - empty tags created
     *   - list items
     *   - tables
     *   - whitespace
     *   - left and right bias
     */

    container.dom().innerHTML =
      '<p>One</p>' +
      '<table><tbody><tr><th>Heading</th></tr><tr><td>Data</td></tr></tbody></table>' +
      '<p>Two</p>';
    check(
      '<p>O<strong>ne</strong></p>' +
      '<table><tbody><tr><th><strong>Heading</strong></th></tr><tr><td><strong>Data</strong></td></tr></tbody></table>' +
      '<p><strong>T</strong>wo</p>',
      [ 0, 0 ], 'O'.length, [ 2, 0 ], 'T'.length
    );

    container.dom().innerHTML = 
      '<p>This is the second line.</p>' +
      '<h3>This is the heading line.</h3>' +
      '<ol><li>apples</li><li>oranges</li>  </ol>' + 
      'and more' +
      '<br>' +
      '<p>the</p>' + 
      'something one' +
      '<br>';
    check(
      '<p>This is the s<strong>econd line.</strong></p>' +
      '<h3><strong>This is the heading line.</strong></h3>' +
      // KILL THE WHITESPACE 
      '<ol><li><strong>apples</strong></li><li><strong>oranges</strong></li><strong>  </strong></ol>' + 
      '<strong>and more' +
      '<br>' +      
      '</strong>' +
      '<p><strong>the</strong></p>' + 
      '<strong>someth</strong>ing one' +
      '<br>',
      [ 0, 0 ], 'This is the s'.length, [ 6 ], 'someth'.length
    );

    // This is now an infinite loop!
    container.dom().innerHTML = 
      '<ol><li>apples</li><li>oranges</li>  </ol><p>And breaking it:</p><ol><li>here</li></ol>and more<br>and more<br>and m<b>or</b>e<br>';
    check(
      '<ol><li>apples</li><li>oranges</li>  </ol><p>And bre<strong>aking it:</strong></p><ol><li><strong>here</strong></li></ol><strong>and more<br>and mo</strong>re<br>and m<b>or</b>e<br>',
      [ 1, 0 ], 7, [ 5 ], 6
    );

    container.dom().innerHTML = 
      'Text n<span style="font-weight: bold;">ode <br> Another text node <br></span>' +
      '<h3><span style="font-weight: bold;">This is the heading line.</span></h3>';
    check(
      'Text n<span style="font-weight: bold;">ode <br> Anot<strong>her text node <br></strong></span>' +
      '<h3><span style="font-weight: bold;"><strong>Thi</strong>s is the heading line.</span></h3>',
      [ 1, 2 ], 5, [ 2, 0, 0 ], 3
    );

    container.dom().innerHTML = 
      'Text node <br> Another text node <br><p>This is the first line of what I am typing</p><p>This is the second line.</p>';
    check(
      'Text n<strong>ode <br> Another text node <br></strong><p><strong>This is the first line of what I am typing</strong></p>' +
      '<p><strong>This is th</strong>e second line.</p>',
      [ 0 ], 'Text n'.length, [ 5, 0 ], 'This is th'.length);

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
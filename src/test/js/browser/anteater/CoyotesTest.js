test(
  'CoyotesTest',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.compass.Arr',
    'ephox.robin.anteater.Coyotes',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Hierarchy',
    'ephox.sugar.api.Insert'
  ],

  function (DomUniverse, Arr, Coyotes, Body, Compare, Element, Hierarchy, Insert) {
    var find = function (path) {
      return Hierarchy.follow(container, path).getOrDie('Could not find the path: ' + path.join(','));
    };

    var body = Body.body();

    var container = Element.fromTag('div');
    container.dom().innerHTML =
    '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
    '<p>And another <u>paragraph</u></p>' +
    '<p>Plus one more.</p>' +
    '<p>Last one, I promise</p>';

    Insert.append(body, container);

    var isRoot = function (elem) {
      return Compare.eq(elem, container);
    };

    var check = function (expected, start, soffset, finish, foffset) {
      var actual = Coyotes.wile(DomUniverse(), isRoot, find(start), soffset, find(finish), foffset);
      assert.eq(expected.length, actual.length, 'The length of coyotes was different. Expected: ' + expected.length + ', actual: ' + actual.length);
      Arr.each(expected, function (exp, i) {
        var act = actual[i];
        assert.eq(true, Compare.eq(find(exp.start), act.start));
        assert.eq(true, Compare.eq(find(exp.end), act.end));
      })
    };

    container.dom().innerHTML =
    '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
    '<p>And another <u>paragraph</u></p>' +
    '<p>Plus one more.</p>' +
    '<p>Last one, I promise</p>';
    check([
      { start: [ 0, 1, 0 ], end: [ 0, 4 ] },
      { start: [ 1, 0 ], end: [ 1, 1 ] },
      { start: [ 2, 0 ], end: [ 2, 0 ] },
      { start: [ 3, 0 ], end: [ 3, 0 ] }
    ], [ 0, 1, 0 ], 'the'.length, [ 3, 0 ], 'Last'.length);

    container.dom().innerHTML =
    '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
    '<p>And another <u>paragraph</u></p>' +
    '<p>Plus one more.</p>' +
    '<p>Last one, I promise</p>';
    check([
      { start: [ 0, 1, 0 ], end: [ 0, 4 ] },
      { start: [ 1, 0 ], end: [ 1, 1, 0 ] }
    ], [ 0, 1, 0 ], 'the'.length, [ 1, 1, 0 ], 'par'.length);

    container.dom().innerHTML =
    '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
    '<p>And another <u>paragraph</u></p>' +
    '<p>Plus one more.</p>' +
    '<p>Last one, I promise</p>';
    check([
      { start: [ 0, 1, 0 ], end: [ 0, 4 ] },
      { start: [ 1, 0 ], end: [ 1, 1, 0 ] }
    ], [ 0, 1, 0 ], 'the'.length, [ 1, 1, 0 ], 'par'.length);
  }
);
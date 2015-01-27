test(
  'CoyotesTest',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.anteater.Coyotes',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Hierarchy'
  ],

  function (DomUniverse, Coyotes, Compare, Element, Hierarchy) {
    var find = function (path) {
      return Hierarchy.follow(container, path).getOrDie('Could not find the path: ' + path.join(','));
    };

    var container = Element.fromTag('div');
    container.dom().innerHTML =
    '<p>This is <b>the word</b> that I can understand, even if <i>it</i> is not the same as before.</p>' +
    '<p>And another <u>paragraph</u></p>' +
    '<p>Plus one more.</p>' +
    '<p>Last one, I promise</p>';

    var isRoot = function (elem) {
      return Compare.eq(elem, container);
    };

    var result = Coyotes.wile(DomUniverse(), isRoot, find([ 0, 1, 0 ]), 'the'.length, find([ 3, 0 ]), 'Last'.length);
    console.log('result: ', result);
  }
);
test(
  'RemoveTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Classes',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.test.Div',
    'ephox.sugar.test.EphoxElement'
  ],

  function (Arr, Body, Class, Classes, Element, Html, Insert, Remove, Traverse, Div, EphoxElement) {
    var runChecks = function (connected) {
      var container = Div();
      var span = EphoxElement('span');
      var ol = EphoxElement('ol');
      var li1 = EphoxElement('li');
      var li2 = EphoxElement('li');
      var li3 = EphoxElement('li');
      var li4 = EphoxElement('li');
      var li0 = EphoxElement('li');
      Classes.add(li2, ['second', 'third']);
      Class.add(li3, 'l3');
      Class.add(li4, 'l4');
      Class.add(li0, 'l0');
      var p = EphoxElement('p');
      var p2 = EphoxElement('p');

      Insert.append(container, p);
      Insert.append(container, p2);
      Insert.append(p, span);

      if (connected) Insert.append(Body.body(), container);

      assert.eq('<p><span></span></p><p></p>', Html.get(container));
      Remove.remove(p2);
      assert.eq('<p><span></span></p>', Html.get(container));
      Insert.append(container, p2);
      assert.eq('<p><span></span></p><p></p>', Html.get(container));
      Remove.remove(span);
      assert.eq('<p></p><p></p>', Html.get(container));
      Remove.empty(container);

      // regular empty check
      assert.eq('', Html.get(container));
      assert.eq(0, Traverse.children(container).length);

      // after inserting an empty text node, empty doesn't always mean empty!
      Insert.append(container, Element.fromText(''));
      Remove.empty(container);
      assert.eq('', Html.get(container));
      assert.eq(0, Traverse.children(container).length);

      Remove.remove(container);
    };

    runChecks(false);
    runChecks(true);
  }
);

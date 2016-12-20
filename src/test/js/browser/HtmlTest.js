test(
  'HtmlTest',

  [
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.test.Div'
  ],

  function (Html, Insert, Div) {

    // checks that Html.getOuter does not fiddle with the dom
    var c = Div();
    var container = Div();
    Insert.append(container, c);
    assert.eq('<div></div>', Html.getOuter(c));

    assert.eq(true, c.dom().parentNode == container.dom(), 'getOuter must not change the DOM');

    var content = '<p>stuff</p>';
    Html.set(c, content);
    assert.eq(content, c.dom().innerHTML);
    assert.eq(content, Html.get(c));
  }
);

test(
  'FragmentTest',

  [
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Fragment',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.dom.Insert'
  ],

  function (Element, Fragment, Html, Insert) {
    var fragment = Fragment.fromElements([
      Element.fromHtml('<span>Hi</span>'),
      Element.fromTag('br'),
      Element.fromHtml('<p>One</p>')
    ]);

    var container = Element.fromTag('div');
    Insert.append(container, fragment);

    assert.eq('<span>Hi</span><br><p>One</p>', Html.get(container));
  }
);

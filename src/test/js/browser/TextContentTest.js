test(
  'TextContentTest',

  [
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Text',
    'ephox.sugar.api.properties.TextContent'
  ],

  function (Element, Text, TextContent) {
    var element = Element.fromHtml('<p>Hello <strong>World!</strong></p>');
    assert.eq('Hello World!', TextContent.get(element));
    TextContent.set(element, 'My text value');
    assert.eq('My text value', TextContent.get(element));

    var textnode = Element.fromText('This is just text');
    assert.eq('This is just text', TextContent.get(textnode));
    TextContent.set(textnode, 'new text value');
    assert.eq('new text value', TextContent.get(textnode));
    assert.eq('new text value', Text.get(textnode));

    var comment = Element.fromDom(document.createComment('commenting checking'));
    assert.eq('commenting checking', TextContent.get(comment));
    TextContent.set(comment, 'new comment value');
    assert.eq('new comment value', TextContent.get(comment));
  }
);

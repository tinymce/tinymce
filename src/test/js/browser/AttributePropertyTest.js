test(
  'AttributePropertyTest',

  [
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.AttributeProperty',
    'ephox.sugar.test.EphoxElement'
  ],

  function (Attr, AttributeProperty, EphoxElement) {
    var attrName = 'custom';
    var attrValue = 'value';
    var init = AttributeProperty(attrName, attrValue);

    var rtlEl = EphoxElement('div');
    Attr.set(rtlEl, 'custom', 'rtl');

    var ltrEl = EphoxElement('div');
    Attr.set(ltrEl, 'custom', 'value');

    var link = EphoxElement('a');
    Attr.set(link, 'href', '#');

    assert.eq(false, init.is(link));
    assert.eq(false, init.is(rtlEl));
    assert.eq(true, init.is(ltrEl));

    init.remove(rtlEl);
    assert.eq(Attr.get(rtlEl, 'custom'), undefined);
    init.set(rtlEl);
    assert.eq(Attr.get(rtlEl, 'custom'), 'value');

    init.set(link);
    assert.eq(Attr.get(link, 'custom'), 'value');
    init.remove(link);
    assert.eq(Attr.get(link, 'custom'), undefined);




  }
);
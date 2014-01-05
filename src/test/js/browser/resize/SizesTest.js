test(
  'SizesTest',

  [
    'ephox.snooker.resize.Sizes',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Width'
  ],

  function (Sizes, Css, Element, Height, Insert, Remove, SelectorFind, Width) {
    var body = SelectorFind.first('body').getOrDie();

    var div = Element.fromTag('div');
    Width.set(div, 300);
    Height.set(div, 200);
    Css.set(div, 'background', 'red');

    Insert.append(body, div);

    var table = Element.fromHtml('<table style="width: 100%;"><tbody><tr><td style="width: 50%;">A</td><td style="width: 50%">B</td></tr></tbody></table>');
    Insert.append(div, table);


    var cell = SelectorFind.descendant(table, 'td').getOrDie();
    assert.eq(150, Sizes.getWidth(cell));
    assert.eq(150, Sizes.getWidth(cell));
    Remove.remove(div);
  }
);

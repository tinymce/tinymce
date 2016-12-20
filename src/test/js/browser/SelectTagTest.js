test(
  'SelectTagTest',

  [
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.tag.SelectTag'
  ],

  function (Element, Select) {
    var checkSome = function (opt, expected) {
      opt.fold(function () {
        assert.fail('Expected to be a some value: ' + expected);
      }, function (v) {
        assert.eq(true, v === expected);
      });
    };

    var select = Element.fromHtml('<select><option selected="selected" value="myvalue">valx</option><option value="non selected">valy</option></select>');
    var selectVal = Select.getValue(select);
    checkSome(selectVal, 'myvalue');

    var emptySelect = Element.fromHtml('<select></select>');
    var emptySelectVal = Select.getValue(emptySelect);
    assert.eq(true, emptySelectVal.isNone());
  }
);

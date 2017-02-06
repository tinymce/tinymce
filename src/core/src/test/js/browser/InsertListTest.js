asynctest(
  'browser.tinymce.core.InsertListTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.InsertList',
    'tinymce.core.html.Node',
    'tinymce.core.html.DomParser',
    'tinymce.core.dom.DOMUtils'
  ],
  function (LegacyUnit, Pipeline, InsertList, Node, DomParser, DOMUtils) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    var createFragment = function (html) {
      var parser = new DomParser({ validate: false });
      var fragment = parser.parse(html);

      return fragment;
    };

    var createDomFragment = function (html) {
      return DOMUtils.DOM.createFragment(html);
    };

    suite.test('isListFragment', function () {
      LegacyUnit.equal(InsertList.isListFragment(createFragment('<ul><li>x</li></ul>')), true);
      LegacyUnit.equal(InsertList.isListFragment(createFragment('<ol><li>x</li></ol>')), true);
      LegacyUnit.equal(InsertList.isListFragment(createFragment('<meta><ul><li>x</li></ul>')), true);
      LegacyUnit.equal(InsertList.isListFragment(createFragment('<ul><li>x</li></ul><span id="mce_marker"></span>')), true);
      LegacyUnit.equal(InsertList.isListFragment(createFragment('<div></div>')), false);
    });

    suite.test('listItems', function () {
      var list = createDomFragment('<ul><li>a</li><li>b</li><li>c</li></ul>').firstChild;

      LegacyUnit.equal(InsertList.listItems(list).length, 3);
      LegacyUnit.equal(InsertList.listItems(list)[0].nodeName, 'LI');
    });

    suite.test('trimListItems', function () {
      var list = createDomFragment('<ul><li>a</li><li>b</li><li></li></ul>').firstChild;

      LegacyUnit.equal(InsertList.listItems(list).length, 3);
      LegacyUnit.equal(InsertList.trimListItems(InsertList.listItems(list)).length, 2);
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);

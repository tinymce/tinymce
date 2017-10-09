asynctest(
  'browser.tinymce.core.InsertListTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.html.DomParser',
    'tinymce.core.html.Node',
    'tinymce.core.html.Schema',
    'tinymce.core.InsertList'
  ],
  function (Pipeline, LegacyUnit, DOMUtils, DomParser, Node, Schema, InsertList) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var schema = new Schema({});

    var createFragment = function (html) {
      var parser = new DomParser({ validate: false });
      var fragment = parser.parse(html);

      return fragment;
    };

    var createDomFragment = function (html) {
      return DOMUtils.DOM.createFragment(html);
    };

    suite.test('isListFragment', function () {
      LegacyUnit.equal(InsertList.isListFragment(schema, createFragment('<ul><li>x</li></ul>')), true);
      LegacyUnit.equal(InsertList.isListFragment(schema, createFragment('<ol><li>x</li></ol>')), true);
      LegacyUnit.equal(InsertList.isListFragment(schema, createFragment('<meta><ul><li>x</li></ul>')), true);
      LegacyUnit.equal(InsertList.isListFragment(schema, createFragment('<ul><li>x</li></ul><span id="mce_marker"></span>')), true);
      LegacyUnit.equal(InsertList.isListFragment(schema, createFragment('<ul><li>x</li></ul><p><br></p>')), true);
      LegacyUnit.equal(InsertList.isListFragment(schema, createFragment('<ul><li>x</li></ul><p></p>')), true);
      LegacyUnit.equal(InsertList.isListFragment(schema, createFragment('<ul><li>x</li></ul><p>\u00a0</p>')), true);
      LegacyUnit.equal(InsertList.isListFragment(schema, createFragment('<ul><li>x</li></ul><p>x</p>')), false);
      LegacyUnit.equal(InsertList.isListFragment(schema, createFragment('<div></div>')), false);
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
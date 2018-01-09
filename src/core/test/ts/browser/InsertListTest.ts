import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import DOMUtils from 'tinymce/core/dom/DOMUtils';
import DomParser from 'tinymce/core/html/DomParser';
import Node from 'tinymce/core/html/Node';
import Schema from 'tinymce/core/html/Schema';
import InsertList from 'tinymce/core/InsertList';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.InsertListTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];
  var suite = LegacyUnit.createSuite();
  var schema = Schema({});

  var createFragment = function (html) {
    var parser = DomParser({ validate: false });
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
});


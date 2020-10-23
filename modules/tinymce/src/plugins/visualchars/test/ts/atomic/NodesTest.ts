import { Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import * as Nodes from 'tinymce/plugins/visualchars/core/Nodes';

UnitTest.test('atomic.tinymce.plugins.visualchars.NodesTest', function () {
  const testReplaceWithSpans = function () {
    Assertions.assertHtml(
      'should return span around shy and nbsp',
      'a<span data-mce-bogus="1" class="mce-nbsp">\u00a0</span>b<span data-mce-bogus="1" class="mce-shy">\u00AD</span>',
      Nodes.replaceWithSpans('a' + Unicode.nbsp + 'b' + Unicode.softHyphen)
    );
  };

  const testFilterDescendants = function () {
    const div = document.createElement('div');
    div.innerHTML = '<p>a</p>' +
                    '<p>b' + Unicode.nbsp + '</p>' +
                    '<p>c</p>' +
                    '<p>d' + Unicode.softHyphen + '</p>';

    Assertions.assertEq(
      'should return list with nodes with shy or nbsp in it',
      2,
      Nodes.filterDescendants(SugarElement.fromDom(div), Nodes.isMatch).length
    );
  };

  const testFilterDescendants2 = function () {
    const div = document.createElement('div');
    div.innerHTML = '<p>a' + Unicode.nbsp + '</p>' +
                    '<p>b' + Unicode.nbsp + '</p>' +
                    '<p>c' + Unicode.nbsp + '</p>' +
                    '<p>d' + Unicode.softHyphen + '</p>';

    Assertions.assertEq(
      'should return list with nodes with shy or nbsp in it',
      4,
      Nodes.filterDescendants(SugarElement.fromDom(div), Nodes.isMatch).length
    );
  };

  testReplaceWithSpans();
  testFilterDescendants();
  testFilterDescendants2();
});

import { Assertions } from '@ephox/agar';
import { Element } from '@ephox/sugar';
import Nodes from 'tinymce/plugins/visualchars/core/Nodes';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('atomic.tinymce.plugins.visualchars.NodesTest', function () {
  const nbsp = '\u00a0';
  const shy = '\u00AD';

  const testReplaceWithSpans = function () {
    Assertions.assertHtml(
      'should return span around shy and nbsp',
      'a<span data-mce-bogus="1" class="mce-nbsp">\u00a0</span>b<span data-mce-bogus="1" class="mce-shy">\u00AD</span>',
      Nodes.replaceWithSpans('a' + nbsp + 'b' + shy)
    );
  };

  const testFilterDescendants = function () {
    const div = document.createElement('div');
    div.innerHTML = '<p>a</p>' +
                    '<p>b' + nbsp + '</p>' +
                    '<p>c</p>' +
                    '<p>d' + shy + '</p>';

    Assertions.assertEq(
      'should return list with nodes with shy or nbsp in it',
      2,
      Nodes.filterDescendants(Element.fromDom(div), Nodes.isMatch).length
    );
  };

  const testFilterDescendants2 = function () {
    const div = document.createElement('div');
    div.innerHTML = '<p>a' + nbsp + '</p>' +
                    '<p>b' + nbsp + '</p>' +
                    '<p>c' + nbsp + '</p>' +
                    '<p>d' + shy + '</p>';

    Assertions.assertEq(
      'should return list with nodes with shy or nbsp in it',
      4,
      Nodes.filterDescendants(Element.fromDom(div), Nodes.isMatch).length
    );
  };

  testReplaceWithSpans();
  testFilterDescendants();
  testFilterDescendants2();
});

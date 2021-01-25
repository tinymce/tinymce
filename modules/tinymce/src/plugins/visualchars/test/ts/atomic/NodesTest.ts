import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as Nodes from 'tinymce/plugins/visualchars/core/Nodes';

describe('atomic.tinymce.plugins.visualchars.NodesTest', () => {
  context('replaceWithSpans', () => {
    it('replace with spans', () => {
      Assertions.assertHtml(
        'should return span around shy and nbsp',
        'a<span data-mce-bogus="1" class="mce-nbsp">\u00a0</span>b<span data-mce-bogus="1" class="mce-shy">\u00AD</span>',
        Nodes.replaceWithSpans('a' + Unicode.nbsp + 'b' + Unicode.softHyphen)
      );
    });
  });

  context('filterDescendants', () => {
    it('should return list with nodes with shy or nbsp in it', () => {
      const div = document.createElement('div');

      // 2 matches
      div.innerHTML = (
        '<p>a</p>' +
        '<p>b' + Unicode.nbsp + '</p>' +
        '<p>c</p>' +
        '<p>d' + Unicode.softHyphen + '</p>'
      );
      assert.equal(2, Nodes.filterDescendants(SugarElement.fromDom(div), Nodes.isMatch).length);

      // 4 matches
      div.innerHTML = (
        '<p>a' + Unicode.nbsp + '</p>' +
        '<p>b' + Unicode.nbsp + '</p>' +
        '<p>c' + Unicode.nbsp + '</p>' +
        '<p>d' + Unicode.softHyphen + '</p>'
      );
      assert.equal(4, Nodes.filterDescendants(SugarElement.fromDom(div), Nodes.isMatch).length);
    });
  });

});

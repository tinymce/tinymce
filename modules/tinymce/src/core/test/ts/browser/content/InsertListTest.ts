import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import DomParser from 'tinymce/core/api/html/DomParser';
import AstNode from 'tinymce/core/api/html/Node';
import Schema from 'tinymce/core/api/html/Schema';
import * as InsertList from 'tinymce/core/content/InsertList';

describe('browser.tinymce.core.content.InsertListTest', () => {
  const schema = Schema({});

  const createFragment = (html: string): AstNode => {
    const parser = DomParser({ validate: false });
    const fragment = parser.parse(html);
    return fragment;
  };

  const createDomFragment = (html: string): DocumentFragment => {
    return DOMUtils.DOM.createFragment(html);
  };

  it('isListFragment', () => {
    assert.isTrue(InsertList.isListFragment(schema, createFragment('<ul><li>x</li></ul>')));
    assert.isTrue(InsertList.isListFragment(schema, createFragment('<ol><li>x</li></ol>')));
    assert.isTrue(InsertList.isListFragment(schema, createFragment('<meta><ul><li>x</li></ul>')));
    assert.isTrue(InsertList.isListFragment(schema, createFragment('<ul><li>x</li></ul><span id="mce_marker"></span>')));
    assert.isTrue(InsertList.isListFragment(schema, createFragment('<ul><li>x</li></ul><p><br></p>')));
    assert.isTrue(InsertList.isListFragment(schema, createFragment('<ul><li>x</li></ul><p></p>')));
    assert.isTrue(InsertList.isListFragment(schema, createFragment('<ul><li>x</li></ul><p>\u00a0</p>')));
    assert.isFalse(InsertList.isListFragment(schema, createFragment('<ul><li>x</li></ul><p>x</p>')));
    assert.isFalse(InsertList.isListFragment(schema, createFragment('<div></div>')));
  });

  it('listItems', () => {
    const list = createDomFragment('<ul><li>a</li><li>b</li><li>c</li></ul>').firstChild as HTMLUListElement;

    assert.lengthOf(InsertList.listItems(list), 3);
    assert.equal(InsertList.listItems(list)[0].nodeName, 'LI');
  });

  it('trimListItems', () => {
    const list = createDomFragment('<ul><li>a</li><li>b</li><li></li></ul>').firstChild as HTMLUListElement;

    assert.lengthOf(InsertList.listItems(list), 3);
    assert.lengthOf(InsertList.trimListItems(InsertList.listItems(list)), 2);
  });
});

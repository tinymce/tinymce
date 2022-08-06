import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as CaretBookmark from 'tinymce/core/bookmark/CaretBookmark';
import CaretPosition from 'tinymce/core/caret/CaretPosition';

import * as CaretAsserts from '../../module/test/CaretAsserts';
import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.CaretBookmarkTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const getRoot = viewBlock.get;
  const setupHtml = viewBlock.update;

  const createTextPos = (textNode: Node, offset: number) => {
    return CaretPosition(textNode, offset);
  };

  const getElement = (id: string): HTMLElement =>
    document.getElementById(id) as HTMLElement;

  it('create element index', () => {
    setupHtml('<b></b><i></i><b></b>');
    assert.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().childNodes[0])), 'b[0],before');
    assert.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().childNodes[1])), 'i[0],before');
    assert.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().childNodes[2])), 'b[1],before');
    assert.equal(CaretBookmark.create(getRoot(), CaretPosition.after(getRoot().childNodes[2])), 'b[1],after');
  });

  it('create text index', () => {
    setupHtml('a<b></b>b<b></b>ccc');
    assert.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[0], 0)), 'text()[0],0');
    assert.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[2], 1)), 'text()[1],1');
    assert.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[4], 3)), 'text()[2],3');
  });

  it('create text index on fragmented text nodes', () => {
    setupHtml('a');
    getRoot().appendChild(document.createTextNode('b'));
    getRoot().appendChild(document.createTextNode('c'));
    getRoot().appendChild(document.createElement('b'));
    getRoot().appendChild(document.createTextNode('d'));
    getRoot().appendChild(document.createTextNode('e'));

    assert.lengthOf(getRoot().childNodes, 6);
    assert.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[0], 0)), 'text()[0],0');
    assert.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[1], 0)), 'text()[0],1');
    assert.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[2], 0)), 'text()[0],2');
    assert.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[4], 0)), 'text()[1],0');
    assert.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[5], 0)), 'text()[1],1');
  });

  it('create br element index', () => {
    setupHtml('<p><br data-mce-bogus="1"></p><p><br></p>');
    assert.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().firstChild?.firstChild as Node)), 'p[0]/br[0],before');
    assert.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().lastChild?.firstChild as Node)), 'p[1]/br[0],before');
  });

  it('create deep element index', () => {
    setupHtml('<p><span>a</span><span><b id="a"></b><b id="b"></b><b id="c"></b></span></p>');
    assert.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getElement('a'))), 'p[0]/span[1]/b[0],before');
    assert.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getElement('b'))), 'p[0]/span[1]/b[1],before');
    assert.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getElement('c'))), 'p[0]/span[1]/b[2],before');
    assert.equal(CaretBookmark.create(getRoot(), CaretPosition.after(getElement('c'))), 'p[0]/span[1]/b[2],after');
  });

  it('create deep text index', () => {
    setupHtml('<p><span>a</span><span id="x">a<b></b>b<b></b>ccc</span></p>');
    assert.equal(
      CaretBookmark.create(getRoot(), createTextPos(getElement('x').childNodes[0], 0)),
      'p[0]/span[1]/text()[0],0'
    );
    assert.equal(
      CaretBookmark.create(getRoot(), createTextPos(getElement('x').childNodes[2], 1)),
      'p[0]/span[1]/text()[1],1'
    );
    assert.equal(
      CaretBookmark.create(getRoot(), createTextPos(getElement('x').childNodes[4], 3)),
      'p[0]/span[1]/text()[2],3'
    );
  });

  it('create element index from bogus', () => {
    setupHtml('<b></b><span data-mce-bogus="1"><b></b><span data-mce-bogus="1"><b></b><b></b></span></span>');
    assert.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().lastChild?.lastChild?.childNodes[1] as Node)), 'b[3],before');
  });

  it('resolve element index', () => {
    setupHtml('<b></b><i></i><b></b>');
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'b[0],before'), CaretPosition.before(getRoot().childNodes[0]));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'b[1],before'), CaretPosition.before(getRoot().childNodes[2]));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'b[1],after'), CaretPosition.after(getRoot().childNodes[2]));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'i[0],before'), CaretPosition.before(getRoot().childNodes[1]));
  });

  it('resolve odd element names', () => {
    setupHtml('<h-2X>abc</h-2X>');
    CaretAsserts.assertCaretPosition(
      CaretBookmark.resolve(getRoot(), 'h-2X[0]/text()[0],2'),
      createTextPos(getRoot().childNodes[0].firstChild as Text, 2)
    );
  });

  it('resolve deep element index', () => {
    setupHtml('<p><span>a</span><span><b id="a"></b><b id="b"></b><b id="c"></b></span></p>');
    CaretAsserts.assertCaretPosition(
      CaretBookmark.resolve(getRoot(), 'p[0]/span[1]/b[0],before'),
      CaretPosition.before(getElement('a'))
    );
    CaretAsserts.assertCaretPosition(
      CaretBookmark.resolve(getRoot(), 'p[0]/span[1]/b[1],before'),
      CaretPosition.before(getElement('b'))
    );
    CaretAsserts.assertCaretPosition(
      CaretBookmark.resolve(getRoot(), 'p[0]/span[1]/b[2],before'),
      CaretPosition.before(getElement('c'))
    );
    CaretAsserts.assertCaretPosition(
      CaretBookmark.resolve(getRoot(), 'p[0]/span[1]/b[2],after'),
      CaretPosition.after(getElement('c'))
    );
  });

  it('resolve text index', () => {
    setupHtml('a<b></b>b<b></b>ccc');
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],0'), createTextPos(getRoot().childNodes[0], 0));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[1],1'), createTextPos(getRoot().childNodes[2], 1));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[2],3'), createTextPos(getRoot().childNodes[4], 3));
  });

  it('resolve text index on fragmented text nodes', () => {
    setupHtml('a');
    getRoot().appendChild(document.createTextNode('b'));
    getRoot().appendChild(document.createTextNode('c'));
    getRoot().appendChild(document.createElement('b'));
    getRoot().appendChild(document.createTextNode('d'));
    getRoot().appendChild(document.createTextNode('e'));

    assert.equal(getRoot().childNodes.length, 6);
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],0'), createTextPos(getRoot().childNodes[0], 0));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],1'), createTextPos(getRoot().childNodes[0], 1));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],2'), createTextPos(getRoot().childNodes[1], 1));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],3'), createTextPos(getRoot().childNodes[2], 1));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],4'), createTextPos(getRoot().childNodes[2], 1));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[1],0'), createTextPos(getRoot().childNodes[4], 0));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[1],1'), createTextPos(getRoot().childNodes[4], 1));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[1],2'), createTextPos(getRoot().childNodes[5], 1));
  });

  it('resolve text index with to high offset', () => {
    setupHtml('abc');
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],10'), createTextPos(getRoot().childNodes[0], 3));
  });

  it('resolve invalid paths', () => {
    setupHtml('<b><i></i></b>');
    assert.isNull(CaretBookmark.resolve(getRoot(), 'x[0]/y[1]/z[2]'));
    assert.isNull(CaretBookmark.resolve(getRoot(), 'b[0]/i[2]'));
    assert.isNull(CaretBookmark.resolve(getRoot(), 'x'));
    assert.isNull(CaretBookmark.resolve(getRoot(), null));
  });
});

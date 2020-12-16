import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import * as CaretBookmark from 'tinymce/core/bookmark/CaretBookmark';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as CaretAsserts from '../../module/test/CaretAsserts';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.CaretBookmarkTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  const getRoot = () => {
    return viewBlock.get();
  };

  const setupHtml = (html) => {
    viewBlock.update(html);
  };

  const createTextPos = (textNode, offset) => {
    return CaretPosition(textNode, offset);
  };

  suite.test('create element index', () => {
    setupHtml('<b></b><i></i><b></b>');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().childNodes[0])), 'b[0],before');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().childNodes[1])), 'i[0],before');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().childNodes[2])), 'b[1],before');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), CaretPosition.after(getRoot().childNodes[2])), 'b[1],after');
  });

  suite.test('create text index', () => {
    setupHtml('a<b></b>b<b></b>ccc');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[0], 0)), 'text()[0],0');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[2], 1)), 'text()[1],1');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[4], 3)), 'text()[2],3');
  });

  suite.test('create text index on fragmented text nodes', () => {
    setupHtml('a');
    getRoot().appendChild(document.createTextNode('b'));
    getRoot().appendChild(document.createTextNode('c'));
    getRoot().appendChild(document.createElement('b'));
    getRoot().appendChild(document.createTextNode('d'));
    getRoot().appendChild(document.createTextNode('e'));

    LegacyUnit.equal(getRoot().childNodes.length, 6);
    LegacyUnit.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[0], 0)), 'text()[0],0');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[1], 0)), 'text()[0],1');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[2], 0)), 'text()[0],2');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[4], 0)), 'text()[1],0');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[5], 0)), 'text()[1],1');
  });

  suite.test('create br element index', () => {
    setupHtml('<p><br data-mce-bogus="1"></p><p><br></p>');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().firstChild.firstChild)), 'p[0]/br[0],before');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().lastChild.firstChild)), 'p[1]/br[0],before');
  });

  suite.test('create deep element index', () => {
    setupHtml('<p><span>a</span><span><b id="a"></b><b id="b"></b><b id="c"></b></span></p>');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), CaretPosition.before(document.getElementById('a'))), 'p[0]/span[1]/b[0],before');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), CaretPosition.before(document.getElementById('b'))), 'p[0]/span[1]/b[1],before');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), CaretPosition.before(document.getElementById('c'))), 'p[0]/span[1]/b[2],before');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), CaretPosition.after(document.getElementById('c'))), 'p[0]/span[1]/b[2],after');
  });

  suite.test('create deep text index', () => {
    setupHtml('<p><span>a</span><span id="x">a<b></b>b<b></b>ccc</span></p>');
    LegacyUnit.equal(
      CaretBookmark.create(getRoot(), createTextPos(document.getElementById('x').childNodes[0], 0)),
      'p[0]/span[1]/text()[0],0'
    );
    LegacyUnit.equal(
      CaretBookmark.create(getRoot(), createTextPos(document.getElementById('x').childNodes[2], 1)),
      'p[0]/span[1]/text()[1],1'
    );
    LegacyUnit.equal(
      CaretBookmark.create(getRoot(), createTextPos(document.getElementById('x').childNodes[4], 3)),
      'p[0]/span[1]/text()[2],3'
    );
  });

  suite.test('create element index from bogus', () => {
    setupHtml('<b></b><span data-mce-bogus="1"><b></b><span data-mce-bogus="1"><b></b><b></b></span></span>');
    LegacyUnit.equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().lastChild.lastChild.childNodes[1])), 'b[3],before');
  });

  suite.test('resolve element index', () => {
    setupHtml('<b></b><i></i><b></b>');
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'b[0],before'), CaretPosition.before(getRoot().childNodes[0]));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'b[1],before'), CaretPosition.before(getRoot().childNodes[2]));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'b[1],after'), CaretPosition.after(getRoot().childNodes[2]));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'i[0],before'), CaretPosition.before(getRoot().childNodes[1]));
  });

  suite.test('resolve odd element names', () => {
    setupHtml('<h-2X>abc</h-2X>');
    CaretAsserts.assertCaretPosition(
      CaretBookmark.resolve(getRoot(), 'h-2X[0]/text()[0],2'),
      createTextPos(getRoot().childNodes[0].firstChild, 2)
    );
  });

  suite.test('resolve deep element index', () => {
    setupHtml('<p><span>a</span><span><b id="a"></b><b id="b"></b><b id="c"></b></span></p>');
    CaretAsserts.assertCaretPosition(
      CaretBookmark.resolve(getRoot(), 'p[0]/span[1]/b[0],before'),
      CaretPosition.before(document.getElementById('a'))
    );
    CaretAsserts.assertCaretPosition(
      CaretBookmark.resolve(getRoot(), 'p[0]/span[1]/b[1],before'),
      CaretPosition.before(document.getElementById('b'))
    );
    CaretAsserts.assertCaretPosition(
      CaretBookmark.resolve(getRoot(), 'p[0]/span[1]/b[2],before'),
      CaretPosition.before(document.getElementById('c'))
    );
    CaretAsserts.assertCaretPosition(
      CaretBookmark.resolve(getRoot(), 'p[0]/span[1]/b[2],after'),
      CaretPosition.after(document.getElementById('c'))
    );
  });

  suite.test('resolve text index', () => {
    setupHtml('a<b></b>b<b></b>ccc');
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],0'), createTextPos(getRoot().childNodes[0], 0));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[1],1'), createTextPos(getRoot().childNodes[2], 1));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[2],3'), createTextPos(getRoot().childNodes[4], 3));
  });

  suite.test('resolve text index on fragmented text nodes', () => {
    setupHtml('a');
    getRoot().appendChild(document.createTextNode('b'));
    getRoot().appendChild(document.createTextNode('c'));
    getRoot().appendChild(document.createElement('b'));
    getRoot().appendChild(document.createTextNode('d'));
    getRoot().appendChild(document.createTextNode('e'));

    LegacyUnit.equal(getRoot().childNodes.length, 6);
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],0'), createTextPos(getRoot().childNodes[0], 0));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],1'), createTextPos(getRoot().childNodes[0], 1));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],2'), createTextPos(getRoot().childNodes[1], 1));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],3'), createTextPos(getRoot().childNodes[2], 1));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],4'), createTextPos(getRoot().childNodes[2], 1));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[1],0'), createTextPos(getRoot().childNodes[4], 0));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[1],1'), createTextPos(getRoot().childNodes[4], 1));
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[1],2'), createTextPos(getRoot().childNodes[5], 1));
  });

  suite.test('resolve text index with to high offset', () => {
    setupHtml('abc');
    CaretAsserts.assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],10'), createTextPos(getRoot().childNodes[0], 3));
  });

  suite.test('resolve invalid paths', () => {
    setupHtml('<b><i></i></b>');
    LegacyUnit.equal(CaretBookmark.resolve(getRoot(), 'x[0]/y[1]/z[2]'), null);
    LegacyUnit.equal(CaretBookmark.resolve(getRoot(), 'b[0]/i[2]'), null);
    LegacyUnit.equal(CaretBookmark.resolve(getRoot(), 'x'), null);
    LegacyUnit.equal(CaretBookmark.resolve(getRoot(), null), null);
  });

  viewBlock.attach();
  Pipeline.async({}, suite.toSteps({}), () => {
    viewBlock.detach();
    success();
  }, failure);
});

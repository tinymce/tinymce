import { before, describe, it } from '@ephox/bedrock-client';

import DomQuery from 'tinymce/core/api/dom/DomQuery';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import { CaretWalker } from 'tinymce/core/caret/CaretWalker';
import * as CaretAsserts from '../../module/test/CaretAsserts';
import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.CaretWalkerTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const getRoot = viewBlock.get;
  const setupHtml = viewBlock.update;

  const getChildNode = (childIndex: number) => getRoot().childNodes[childIndex];

  const findElm = (selector: string) => {
    return DomQuery(selector, getRoot())[0];
  };

  const findElmPos = (selector: string, offset: number) => {
    return CaretPosition(DomQuery(selector, getRoot())[0], offset);
  };

  const findTextPos = (selector: string, offset: number) => {
    return CaretPosition(DomQuery(selector, getRoot())[0].firstChild, offset);
  };

  let logicalCaret;
  before(() => logicalCaret = CaretWalker(getRoot()));

  it('inside empty root', () => {
    setupHtml('');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), null);
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 0)), null);
  });

  it('on null', () => {
    setupHtml('');
    CaretAsserts.assertCaretPosition(logicalCaret.next(null), null);
    CaretAsserts.assertCaretPosition(logicalCaret.prev(null), null);
  });

  it('within text node in root', () => {
    setupHtml('abc');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 0)), CaretPosition(getRoot().firstChild, 1));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 1)), CaretPosition(getRoot().firstChild, 2));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 2)), CaretPosition(getRoot().firstChild, 3));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 3)), null);
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().firstChild, 3)), CaretPosition(getRoot().firstChild, 2));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().firstChild, 2)), CaretPosition(getRoot().firstChild, 1));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().firstChild, 1)), CaretPosition(getRoot().firstChild, 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().firstChild, 0)), null);
  });

  it('within text node in element', () => {
    setupHtml('<p>abc</p>');
    CaretAsserts.assertCaretPosition(logicalCaret.next(findTextPos('p', 0)), findTextPos('p', 1));
    CaretAsserts.assertCaretPosition(logicalCaret.next(findTextPos('p', 1)), findTextPos('p', 2));
    CaretAsserts.assertCaretPosition(logicalCaret.next(findTextPos('p', 2)), findTextPos('p', 3));
    CaretAsserts.assertCaretPosition(logicalCaret.next(findTextPos('p', 3)), null);
    CaretAsserts.assertCaretPosition(logicalCaret.prev(findTextPos('p', 3)), findTextPos('p', 2));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(findTextPos('p', 2)), findTextPos('p', 1));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(findTextPos('p', 1)), findTextPos('p', 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(findTextPos('p', 0)), null);
  });

  it('from index text node over comment', () => {
    setupHtml('abcd<!-- x -->efgh');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), CaretPosition(getRoot().firstChild, 0));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(getRoot().lastChild, 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(getRoot().firstChild, 4));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 3)), CaretPosition(getRoot().lastChild, 4));
  });

  it('from text to text across elements', () => {
    setupHtml('<p>abc</p><p>def</p>');
    CaretAsserts.assertCaretPosition(logicalCaret.next(findTextPos('p:first', 3)), findTextPos('p:last', 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(findTextPos('p:last', 0)), findTextPos('p:first', 3));
  });

  it('from text to text across elements with siblings', () => {
    setupHtml('<p>abc<b><!-- x --></b></p><p><b><!-- x --></b></p><p><b><!-- x --></b>def</p>');
    CaretAsserts.assertCaretPosition(logicalCaret.next(findTextPos('p:first', 3)), CaretPosition(findElm('p:last').lastChild, 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('p:last').lastChild, 0)), findTextPos('p:first', 3));
  });

  it('from input to text', () => {
    setupHtml('123<input>456');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 2)), CaretPosition(getRoot().lastChild, 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 1)), CaretPosition(getRoot().firstChild, 3));
  });

  it('from input to input across elements', () => {
    setupHtml('<p><input></p><p><input></p>');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(findElm('p:first'), 1)), CaretPosition(findElm('p:last'), 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('p:last'), 0)), CaretPosition(findElm('p:first'), 1));
  });

  it('next br to br across elements', () => {
    setupHtml('<p><br></p><p><br></p>');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(findElm('p:first'), 0)), CaretPosition(findElm('p:last'), 0));
  });

  it('from text node to before cef span over br', () => {
    setupHtml('<p>a<br><span contenteditable="false">X</span></p>');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(findElm('p'), 1)), CaretPosition(findElm('p'), 2));
  });

  it('prev br to br across elements', () => {
    setupHtml('<p><br></p><p><br></p>');
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('p:last'), 0)), CaretPosition(findElm('p:first'), 0));
  });

  it('from before/after br to text', () => {
    setupHtml('<br>123<br>456<br>789');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), CaretPosition(getChildNode(1), 0));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 2)), CaretPosition(getChildNode(3), 0));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 4)), CaretPosition(getChildNode(5), 0));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 5)), CaretPosition(getRoot().lastChild, 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 5)), CaretPosition(getRoot(), 4));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 4)), CaretPosition(getChildNode(3), 3));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 0));
  });

  it('over br', () => {
    setupHtml('<br><br><br>');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 2));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 2)), null);
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 3)), null);
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 3)), CaretPosition(getRoot(), 2));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 0)), null);
  });

  it('over input', () => {
    setupHtml('<input><input><input>');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 2));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 3));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 3)), null);
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 3)), CaretPosition(getRoot(), 2));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 0)), null);
  });

  it('over img', () => {
    setupHtml('<img src="about:blank"><img src="about:blank"><img src="about:blank">');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 2));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 3));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 3)), null);
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 3)), CaretPosition(getRoot(), 2));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 0)), null);
  });

  it('over script/style/textarea', () => {
    setupHtml('a<script>//x</script>b<style>x{}</style>c<textarea>x</textarea>d');
    CaretAsserts.assertCaretPosition(
      logicalCaret.next(CaretPosition(getRoot().firstChild, 1)),
      CaretPosition(getRoot().childNodes[2], 0)
    );
    CaretAsserts.assertCaretPosition(
      logicalCaret.next(CaretPosition(getRoot().childNodes[2], 1)),
      CaretPosition(getRoot().childNodes[4], 0)
    );
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 5)), CaretPosition(getRoot(), 6));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 6)), CaretPosition(getRoot(), 5));
    CaretAsserts.assertCaretPosition(
      logicalCaret.prev(CaretPosition(getRoot().childNodes[4], 0)),
      CaretPosition(getRoot().childNodes[2], 1)
    );
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(getRoot().childNodes[0], 1));
  });

  it('around tables', () => {
    setupHtml('a<table><tr><td>A</td></tr></table><table><tr><td>B</td></tr></table>b');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 1)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), findTextPos('td:first', 0));
    CaretAsserts.assertCaretPosition(logicalCaret.next(findTextPos('td:first', 1)), CaretPosition(getRoot(), 2));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 2)), findTextPos('td:last', 0));
    CaretAsserts.assertCaretPosition(logicalCaret.next(findTextPos('table:last td', 1)), CaretPosition(getRoot(), 3));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 3)), CaretPosition(getRoot().lastChild, 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().lastChild, 0)), CaretPosition(getRoot(), 3));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 3)), findTextPos('td:last', 1));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(findTextPos('td:last', 0)), CaretPosition(getRoot(), 2));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), findTextPos('td:first', 1));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(findTextPos('td:first', 0)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 1)), CaretPosition(getRoot().firstChild, 1));
  });

  it('over cE=false', () => {
    setupHtml('123<span contentEditable="false">a</span>456');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 3)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 2));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().lastChild, 0)), CaretPosition(getRoot(), 2));
  });
  /*
    it('from outside cE=false to nested cE=true', () => {
      setupHtml('abc<span contentEditable="false">b<span contentEditable="true">c</span></span>def');
      CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 3)), CaretPosition(getRoot(), 1));
      CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), findTextPos('span span', 0));
      CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().lastChild, 0)), CaretPosition(getRoot(), 2));
      CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), findTextPos('span span', 1));
    });

    it('from outside cE=false to nested cE=true before/after cE=false', () => {
      setupHtml('a<span contentEditable="false">b<span contentEditable="true"><span contentEditable="false"></span></span></span>d');
      CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(findElm('span span'), 0));
      CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(findElm('span span'), 1)), CaretPosition(getRoot(), 2));
      CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(findElm('span span'), 1));
    });
  */

  it('from after to last element', () => {
    setupHtml('<input />');
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition.after(getRoot())), CaretPosition(getRoot(), 1));
  });

  it('from after to last element with br', () => {
    setupHtml('<input /><br>');
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition.after(getRoot())), CaretPosition(getRoot(), 1));
  });

  it('from inside cE=true in cE=false to after cE=false', () => {
    setupHtml(
      '<p>' +
      '<span contentEditable="false">' +
      '<span contentEditable="true">' +
      'abc' +
      '</span>' +
      'def' +
      '</span>' +
      '</p>' +
      '<p>abc</p>'
    );

    CaretAsserts.assertCaretPosition(logicalCaret.next(findTextPos('span span', 3)), CaretPosition(findElm('p'), 1));
  });

  it('around cE=false inside nested cE=true', () => {
    setupHtml(
      '<span contentEditable="false">' +
      '<span contentEditable="true">' +
      '<span contentEditable="false">1</span>' +
      '<span contentEditable="false">2</span>' +
      '<span contentEditable="false">3</span>' +
      '</span>' +
      '</span>'
    );

    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(findElm('span span'), 0)), CaretPosition(findElm('span span'), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(findElm('span span'), 1)), CaretPosition(findElm('span span'), 2));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(findElm('span span'), 2)), CaretPosition(findElm('span span'), 3));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(findElm('span span'), 3)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('span span'), 0)), CaretPosition(getRoot(), 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('span span'), 1)), CaretPosition(findElm('span span'), 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('span span'), 2)), CaretPosition(findElm('span span'), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('span span'), 3)), CaretPosition(findElm('span span'), 2));
  });

  it('next from last node', () => {
    setupHtml(
      '<p><b><input></b></p>' +
      '<input>' +
      '<p><b><input></b></p>'
    );

    CaretAsserts.assertCaretPosition(logicalCaret.next(findElmPos('p:first', 1)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.next(findElmPos('p:last', 1)), null);
  });

  it('left/right between cE=false inlines in different blocks', () => {
    setupHtml(
      '<p>' +
      '<span contentEditable="false">abc</span>' +
      '</p>' +
      '<p>' +
      '<span contentEditable="false">def</span>' +
      '</p>'
    );

    CaretAsserts.assertCaretPosition(logicalCaret.next(findElmPos('p:first', 1)), findElmPos('p:last', 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(findElmPos('p:last', 0)), findElmPos('p:first', 1));
  });

  it('from before/after root', () => {
    setupHtml(
      '<p>a</p>' +
      '<p>b</p>'
    );

    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition.before(getRoot())), findTextPos('p:first', 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition.after(getRoot())), findTextPos('p:last', 1));
  });

  it('never into caret containers', () => {
    setupHtml('abc<b data-mce-caret="1">def</b>ghi');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 3)), CaretPosition(getRoot().lastChild, 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().lastChild, 0)), CaretPosition(getRoot().firstChild, 3));
  });
});

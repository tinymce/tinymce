import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Env from 'tinymce/core/api/Env';
import { CaretWalker } from 'tinymce/core/caret/CaretWalker';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import DomQuery from 'tinymce/core/api/dom/DomQuery';
import CaretAsserts from '../../module/test/CaretAsserts';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.CaretWalkerTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  if (!Env.ceFalse) {
    return;
  }

  const getRoot = function () {
    return viewBlock.get();
  };

  const setupHtml = function (html) {
    viewBlock.update(html);
  };

  const findElm = function (selector) {
    return DomQuery(selector, getRoot())[0];
  };

  const findElmPos = function (selector, offset) {
    return CaretPosition(DomQuery(selector, getRoot())[0], offset);
  };

  const findTextPos = function (selector, offset) {
    return CaretPosition(DomQuery(selector, getRoot())[0].firstChild, offset);
  };

  const logicalCaret = CaretWalker(getRoot());

  suite.test('inside empty root', function () {
    setupHtml('');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), null);
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 0)), null);
  });

  suite.test('on null', function () {
    setupHtml('');
    CaretAsserts.assertCaretPosition(logicalCaret.next(null), null);
    CaretAsserts.assertCaretPosition(logicalCaret.prev(null), null);
  });

  suite.test('within text node in root', function () {
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

  suite.test('within text node in element', function () {
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

  suite.test('from index text node over comment', function () {
    setupHtml('abcd<!-- x -->abcd');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), CaretPosition(getRoot().firstChild, 0));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(getRoot().lastChild, 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(getRoot().firstChild, 4));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 3)), CaretPosition(getRoot().lastChild, 4));
  });

  suite.test('from text to text across elements', function () {
    setupHtml('<p>abc</p><p>abc</p>');
    CaretAsserts.assertCaretPosition(logicalCaret.next(findTextPos('p:first', 3)), findTextPos('p:last', 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(findTextPos('p:last', 0)), findTextPos('p:first', 3));
  });

  suite.test('from text to text across elements with siblings', function () {
    setupHtml('<p>abc<b><!-- x --></b></p><p><b><!-- x --></b></p><p><b><!-- x --></b>abc</p>');
    CaretAsserts.assertCaretPosition(logicalCaret.next(findTextPos('p:first', 3)), CaretPosition(findElm('p:last').lastChild, 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('p:last').lastChild, 0)), findTextPos('p:first', 3));
  });

  suite.test('from input to text', function () {
    setupHtml('123<input>456');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 2)), CaretPosition(getRoot().lastChild, 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 1)), CaretPosition(getRoot().firstChild, 3));
  });

  suite.test('from input to input across elements', function () {
    setupHtml('<p><input></p><p><input></p>');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(findElm('p:first'), 1)), CaretPosition(findElm('p:last'), 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('p:last'), 0)), CaretPosition(findElm('p:first'), 1));
  });

  suite.test('next br to br across elements', function () {
    setupHtml('<p><br></p><p><br></p>');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(findElm('p:first'), 0)), CaretPosition(findElm('p:last'), 0));
  });

  suite.test('prev br to br across elements', function () {
    setupHtml('<p><br></p><p><br></p>');
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('p:last'), 0)), CaretPosition(findElm('p:first'), 0));
  });

  suite.test('from before/after br to text', function () {
    setupHtml('<br>123<br>456<br>789');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 3));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 4)), CaretPosition(getRoot(), 5));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 5)), CaretPosition(getRoot().lastChild, 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 5)), CaretPosition(getRoot(), 4));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 4)), CaretPosition(getRoot().childNodes[3], 3));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 0));
  });

  suite.test('over br', function () {
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

  suite.test('over input', function () {
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

  suite.test('over img', function () {
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

  suite.test('over script/style/textarea', function () {
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

  suite.test('around tables', function () {
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

  suite.test('over cE=false', function () {
    setupHtml('123<span contentEditable="false">a</span>456');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 3)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 2));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().lastChild, 0)), CaretPosition(getRoot(), 2));
  });
  /*
    suite.test('from outside cE=false to nested cE=true', function() {
      setupHtml('abc<span contentEditable="false">b<span contentEditable="true">c</span></span>def');
      CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 3)), CaretPosition(getRoot(), 1));
      CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), findTextPos('span span', 0));
      CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().lastChild, 0)), CaretPosition(getRoot(), 2));
      CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), findTextPos('span span', 1));
    });

    suite.test('from outside cE=false to nested cE=true before/after cE=false', function() {
      setupHtml('a<span contentEditable="false">b<span contentEditable="true"><span contentEditable="false"></span></span></span>d');
      CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(findElm('span span'), 0));
      CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(findElm('span span'), 1)), CaretPosition(getRoot(), 2));
      CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(findElm('span span'), 1));
    });
  */

  suite.test('from after to last element', function () {
    setupHtml('<input />');
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition.after(getRoot())), CaretPosition(getRoot(), 1));
  });

  suite.test('from after to last element with br', function () {
    setupHtml('<input /><br>');
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition.after(getRoot())), CaretPosition(getRoot(), 1));
  });

  suite.test('from inside cE=true in cE=false to after cE=false', function () {
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

  suite.test('around cE=false inside nested cE=true', function () {
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

  suite.test('next from last node', function () {
    setupHtml(
      '<p><b><input></b></p>' +
      '<input>' +
      '<p><b><input></b></p>'
    );

    CaretAsserts.assertCaretPosition(logicalCaret.next(findElmPos('p:first', 1)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(logicalCaret.next(findElmPos('p:last', 1)), null);
  });

  suite.test('left/right between cE=false inlines in different blocks', function () {
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

  suite.test('from before/after root', function () {
    setupHtml(
      '<p>a</p>' +
      '<p>b</p>'
    );

    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition.before(getRoot())), findTextPos('p:first', 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition.after(getRoot())), findTextPos('p:last', 1));
  });

  suite.test('never into caret containers', function () {
    setupHtml('abc<b data-mce-caret="1">def</b>ghi');
    CaretAsserts.assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 3)), CaretPosition(getRoot().lastChild, 0));
    CaretAsserts.assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().lastChild, 0)), CaretPosition(getRoot().firstChild, 3));
  });

  viewBlock.attach();
  Pipeline.async({}, suite.toSteps({}), function () {
    viewBlock.detach();
    success();
  }, failure);
});

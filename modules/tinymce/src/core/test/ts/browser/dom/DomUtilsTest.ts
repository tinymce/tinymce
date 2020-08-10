import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import { document, Element, HTMLIFrameElement, HTMLLinkElement, HTMLMetaElement, window } from '@ephox/dom-globals';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Env from 'tinymce/core/api/Env';
import Schema from 'tinymce/core/api/html/Schema';
import Tools from 'tinymce/core/api/util/Tools';
import * as HtmlUtils from '../../module/test/HtmlUtils';

const DOM = DOMUtils(document, { keep_values: true, schema: Schema() });

UnitTest.test('DOMUtils.parseStyle', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  const dom = DOMUtils(document, {
    hex_colors: true, keep_values: true, url_converter(u) {
      return 'X' + u + 'Y';
    }
  });

  Assert.eq('incorrect parsing', 'border: 1px solid red; color: green;', dom.serializeStyle(dom.parseStyle('border: 1px solid red; color: green')));

  Assert.eq('incorrect parsing', 'border: 1px solid #00ffff; color: green;', dom.serializeStyle(dom.parseStyle('border: 1px solid rgb(0, 255, 255); color: green')));

  Assert.eq('incorrect parsing', 'border: 1px solid red;', dom.serializeStyle(
    dom.parseStyle('border-top: 1px solid red; border-left: 1px solid red; border-bottom: 1px solid red; border-right: 1px solid red;')
  ));

  Assert.eq('incorrect parsing', 'border: 1pt none black;', dom.serializeStyle(
    dom.parseStyle('border-width: 1pt 1pt 1pt 1pt; border-style: none none none none; border-color: black black black black;')
  ));

  Assert.eq('incorrect parsing', 'border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;', dom.serializeStyle(
    dom.parseStyle('border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;')
  ));

  Assert.eq('incorrect parsing', `background: transparent url('Xtest.gifY');`, dom.serializeStyle(dom.parseStyle('background: transparent url(test.gif);')));

  Assert.eq('incorrect parsing', `background: transparent url('Xhttp://www.site.com/test.gif?a=1&b=2Y');`, dom.serializeStyle(dom.parseStyle('background: transparent url(http://www.site.com/test.gif?a=1&b=2);')));

  dom.setHTML('test', '<span id="test2" style="   margin-left: 1px;    margin-top: 1px;   margin-right: 1px;   margin-bottom: 1px   "></span>');
  Assert.eq('incorrect attribute value', 'margin: 1px;', dom.getAttrib('test2', 'style'));

  dom.setHTML('test', '<span id="test2" style="background-image: url(test.gif);"></span>');
  Assert.eq('incorrect attribute value', `background-image: url('Xtest.gifY');`, dom.getAttrib('test2', 'style'));

  // dom.get('test').innerHTML = '<span id="test2" style="border: 1px solid #00ff00"></span>';
  // equal(dom.getAttrib('test2', 'style'), Env.ue && !window.getSelection ?
  // 'border: #00ff00 1px solid;' : 'border: 1px solid #00ff00;'); // IE has a separate output

  dom.get('test').innerHTML = '<span id="test2" style="background-image: url(http://www.site.com/test.gif);"></span>';
  Assert.eq('incorrect attribute value', `background-image: url('Xhttp://www.site.com/test.gifY');`, dom.getAttrib('test2', 'style'));

  DOM.remove('test');
});

UnitTest.test('DOMUtils.addClass', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.get('test').className = '';
  DOM.addClass('test', 'abc');
  Assert.eq('incorrect classname', 'abc', DOM.get('test').className);

  DOM.addClass('test', '123');
  Assert.eq('incorrect classname', 'abc 123', DOM.get('test').className);

  DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
  DOM.addClass(DOM.select('span', 'test'), 'abc');
  Assert.eq('incorrect classname', 'abc', DOM.get('test2').className);
  Assert.eq('incorrect classname', 'abc', DOM.get('test3').className);
  Assert.eq('incorrect classname', 'abc', DOM.get('test4').className);
  DOM.get('test').innerHTML = '';

  DOM.remove('test');
});

UnitTest.test('DOMUtils.removeClass', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.get('test').className = 'abc 123 xyz';
  DOM.removeClass('test', '123');
  Assert.eq('incorrect classname', 'abc xyz', DOM.get('test').className);

  DOM.get('test').innerHTML = (
    '<span id="test2" class="test1"></span><span id="test3" class="test test1 test"></span><span id="test4" class="test1 test"></span>'
  );
  DOM.removeClass(DOM.select('span', 'test'), 'test1');
  Assert.eq('incorrect classname', '', DOM.get('test2').className);
  Assert.eq('incorrect classname', 'test test', DOM.get('test3').className);
  Assert.eq('incorrect classname', 'test', DOM.get('test4').className);

  DOM.get('test').innerHTML = '<span id="test2" class="test"></span>';
  DOM.removeClass('test2', 'test');
  Assert.eq('incorrect classname', '<span id="test2"></span>', HtmlUtils.normalizeHtml(DOM.get('test').innerHTML));

  DOM.remove('test');
});

UnitTest.test('DOMUtils.hasClass', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.get('test').className = 'abc 123 xyz';
  Assert.eq('incorrect hasClass result', true, DOM.hasClass('test', 'abc'));
  Assert.eq('incorrect hasClass result', true, DOM.hasClass('test', '123'));
  Assert.eq('incorrect hasClass result', true, DOM.hasClass('test', 'xyz'));
  Assert.eq('incorrect hasClass result', false, DOM.hasClass('test', 'aaa'));

  DOM.get('test').className = 'abc';
  Assert.eq('incorrect hasClass result', true, DOM.hasClass('test', 'abc'));

  DOM.get('test').className = 'aaa abc';
  Assert.eq('incorrect hasClass result', true, DOM.hasClass('test', 'abc'));

  DOM.get('test').className = 'abc aaa';
  Assert.eq('incorrect hasClass result', true, DOM.hasClass('test', 'abc'));

  DOM.remove('test');
});

UnitTest.test('DOMUtils.add', () => {
  let e;

  DOM.add(document.body, 'div', { id: 'test' });

  DOM.add('test', 'span', { class: 'abc 123' }, 'content <b>abc</b>');
  e = DOM.get('test').getElementsByTagName('span')[0];
  Assert.eq('incorrect className', 'abc 123', e.className);
  Assert.eq('incorrect innerHTML', 'content <b>abc</b>', e.innerHTML.toLowerCase());
  DOM.remove(e);

  DOM.add('test', 'span', { class: 'abc 123' });
  e = DOM.get('test').getElementsByTagName('span')[0];
  Assert.eq('incorrect classname', 'abc 123', e.className);
  DOM.remove(e);

  DOM.add('test', 'span');
  e = DOM.get('test').getElementsByTagName('span')[0];
  Assert.eq('incorrect nodeName', 'SPAN', e.nodeName);
  DOM.remove(e);

  DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
  DOM.add([ 'test2', 'test3', 'test4' ], 'span', { class: 'abc 123' });
  Assert.eq('incorrect length', 6, DOM.select('span', 'test').length);

  DOM.remove('test');
});

UnitTest.test('DOMUtils.create', () => {
  const e = DOM.create('span', { class: 'abc 123' }, 'content <b>abc</b>');

  Assert.eq('incorrect nodeName', 'SPAN', e.nodeName);
  Assert.eq('incorrect className', 'abc 123', e.className);
  Assert.eq('innerHTML was wrong', 'content <b>abc</b>', e.innerHTML.toLowerCase());
});

UnitTest.test('DOMUtils.createHTML', () => {
  Assert.eq('', '<span id="id1" class="abc 123">content <b>abc</b></span>', DOM.createHTML('span', {
    id: 'id1',
    class: 'abc 123'
  }, 'content <b>abc</b>'));
  Assert.eq('', '<span id="id1" class="abc 123" />', DOM.createHTML('span', { id: 'id1', class: 'abc 123' }));
  Assert.eq('', '<span />', DOM.createHTML('span', { id: null, class: undefined }));
  Assert.eq('', '<span />', DOM.createHTML('span'));
  Assert.eq('', '<span>content <b>abc</b></span>', DOM.createHTML('span', null, 'content <b>abc</b>'));
});

UnitTest.test('DOMUtils.uniqueId', () => {
  Assert.eq('', 'mce_0', DOM.uniqueId());
  Assert.eq('', 'mce_1', DOM.uniqueId());
  Assert.eq('', 'mce_2', DOM.uniqueId());
});

UnitTest.test('DOMUtils.showHide', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.show('test');
  Assert.eq('', '', DOM.get('test').style.display);
  Assert.eq('', false, DOM.isHidden('test'));

  DOM.hide('test');
  Assert.eq('', 'none', DOM.get('test').style.display);
  Assert.eq('', true, DOM.isHidden('test'));

  // Cleanup
  DOM.setAttrib('test', 'style', '');

  DOM.remove('test');
});

UnitTest.test('DOMUtils.select', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.setHTML('test', '<div>test 1</div><div>test 2 <div>test 3</div></div><div>test 4</div>');
  Assert.eq('', 4, DOM.select('div', 'test').length);
  Assert.eq('', true, DOM.select('div', 'test').reverse !== undefined);

  DOM.setHTML('test', '<div class="test1 test2 test3">test 1</div><div class="test2">test 2 <div>test 3</div></div><div>test 4</div>');
  Assert.eq('', 2, DOM.select('div.test2', 'test').length);

  DOM.setHTML('test', '<div class="test1 test2 test3">test 1</div><div class="test2">test 2 <div>test 3</div></div><div>test 4</div>');
  Assert.eq('', 1, DOM.select('div div', 'test').length); // Issue: http://bugs.webkit.org/show_bug.cgi?id=17461
  // alert(DOM.select('div div', 'test').length +","+DOM.get('test').querySelectorAll('div div').length);

  DOM.remove('test');
});

UnitTest.test('DOMUtils.is', () => {
  DOM.add(document.body, 'div', { id: 'test' });
  DOM.setHTML('test', '<div id="textX" class="test">test 1</div>');

  Assert.eq('', true, DOM.is(DOM.get('textX'), 'div'));
  Assert.eq('', true, DOM.is(DOM.get('textX'), 'div#textX.test'));
  Assert.eq('', false, DOM.is(DOM.get('textX'), 'div#textX2'));
  Assert.eq('', false, DOM.is(null, 'div#textX2'));

  DOM.remove('test');
});

UnitTest.test('DOMUtils.encode', () => {
  Assert.eq('', 'abc&lt;&gt;&quot;&amp;&#39;\u00e5\u00e4\u00f6', DOM.encode(`abc<>"&'\u00e5\u00e4\u00f6`));
});

UnitTest.test('DOMUtils.setGetAttrib', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.setAttrib('test', 'class', 'test 123');
  Assert.eq('', 'test 123', DOM.getAttrib('test', 'class'));

  DOM.setAttrib('test', 'src', 'url');
  Assert.eq('', 'url', DOM.getAttrib('test', 'src'));
  Assert.eq('', 'url', DOM.getAttrib('test', 'data-mce-src'));
  Assert.eq('', '', DOM.getAttrib('test', 'abc'));

  DOM.setAttribs('test', { class: '123', title: 'abc' });
  Assert.eq('', '123', DOM.getAttrib('test', 'class'));
  Assert.eq('', 'abc', DOM.getAttrib('test', 'title'));

  DOM.setAttribs('test', {});
  Assert.eq('', '123', DOM.getAttrib('test', 'class'));
  Assert.eq('', 'abc', DOM.getAttrib('test', 'title'));

  const dom = DOMUtils(document, {
    keep_values: true, url_converter(u, n) {
      return '&<>"' + u + '&<>"' + n;
    }
  });

  dom.setAttribs('test', { src: '123', href: 'abc' });
  Assert.eq('', '&<>"123&<>"src', DOM.getAttrib('test', 'src'));
  Assert.eq('', '&<>"abc&<>"href', DOM.getAttrib('test', 'href'));

  Assert.eq('', '', DOM.getAttrib(document, 'test'));
  Assert.eq('', '', DOM.getAttrib(document, 'test', ''));
  Assert.eq('', 'x', DOM.getAttrib(document, 'test', 'x'));

  DOM.remove('test');
});

UnitTest.test('DOMUtils.setGetAttrib on null', () => {
  Assert.eq('', '', DOM.getAttrib(null, 'test'));
  DOM.setAttrib(null, 'test', null);
});

UnitTest.test('DOMUtils.getAttribs', () => {
  const check = (obj, val) => {
    let count = 0;

    val = val.split(',');

    Tools.each(obj, (o) => {
      if (Tools.inArray(val, o.nodeName.toLowerCase()) !== -1 && o.specified) {
        count++;
      }
    });

    return count === obj.length;
  };

  DOM.add(document.body, 'div', { id: 'test' });

  DOM.get('test').innerHTML = '<span id="test2" class="test"></span>';
  Assert.eq('', true, check(DOM.getAttribs('test2'), 'id,class'));

  DOM.get('test').innerHTML = '<input id="test2" type="checkbox" name="test" value="1" disabled readonly checked></span>';
  Assert.eq('', true, check(DOM.getAttribs('test2'), 'id,type,name,value,disabled,readonly,checked'));

  DOM.remove('test');
});

UnitTest.test('DOMUtils.setGetStyles', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.setStyle('test', 'font-size', '20px');
  Assert.eq('', '20px', DOM.getStyle('test', 'font-size'));

  DOM.setStyle('test', 'fontSize', '21px');
  Assert.eq('', '21px', DOM.getStyle('test', 'fontSize'));

  DOM.setStyles('test', { fontSize: '22px', display: 'inline' });
  Assert.eq('', '22px', DOM.getStyle('test', 'fontSize'));
  Assert.eq('', 'inline', DOM.getStyle('test', 'display'));

  DOM.setStyle('test', 'fontSize', 23);
  Assert.eq('', '23px', DOM.getStyle('test', 'fontSize'));

  DOM.setStyle('test', 'fontSize', 23);
  DOM.setStyle('test', 'fontSize', '');
  Assert.eq('', '', DOM.getStyle('test', 'fontSize'));

  DOM.setStyle('test', 'fontSize', 23);
  DOM.setStyle('test', 'fontSize', null);
  Assert.eq('', '', DOM.getStyle('test', 'fontSize'));

  DOM.setAttrib('test', 'style', '');
  Assert.eq('', 'undefined', typeof DOM.getStyle(null, 'fontSize'));

  DOM.remove('test');
});

UnitTest.test('DOMUtils.getPos', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.setStyles('test', { position: 'absolute', left: 100, top: 110 });
  Assert.eq('', 100, Math.round(DOM.getPos('test').x));
  Assert.eq('', 110, Math.round(DOM.getPos('test').y));

  DOM.setAttrib('test', 'style', '');

  DOM.remove('test');
});

const eqNodeName = (name) => (n) => n.nodeName === name;

UnitTest.test('DOMUtils.getParent', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.get('test').innerHTML = '<div><span>ab<a id="test2" href="">abc</a>c</span></div>';

  Assert.eq('', 'SPAN', DOM.getParent('test2', eqNodeName('SPAN')).nodeName);
  Assert.eq('', 'BODY', DOM.getParent('test2', eqNodeName('BODY')).nodeName);
  Assert.eq('', null, DOM.getParent('test2', eqNodeName('BODY'), document.body));
  Assert.eq('', null, DOM.getParent('test2', eqNodeName('X')));
  Assert.eq('', 'SPAN', DOM.getParent('test2', 'SPAN').nodeName);
  Assert.eq('', null, DOM.getParent('test2', 'body', DOM.get('test')));

  DOM.get('test').innerHTML = '';

  DOM.remove('test');
});

UnitTest.test('DOMUtils.getParents', () => {
  DOM.add(document.body, 'div', { id: 'test' });
  DOM.get('test').innerHTML = '<div><span class="test">ab<span><a id="test2" href="">abc</a>c</span></span></div>';

  Assert.eq('', 2, DOM.getParents('test2', eqNodeName('SPAN')).length);
  Assert.eq('', 2, DOM.getParents('test2', 'span').length);
  Assert.eq('', 1, DOM.getParents('test2', 'span.test').length);
  Assert.eq('', 0, DOM.getParents('test2', 'body', DOM.get('test')).length);

  DOM.remove('test');
});

UnitTest.test('DOMUtils.is', () => {
  DOM.add(document.body, 'div', { id: 'test' });
  DOM.get('test').innerHTML = '<div><span class="test">ab<span><a id="test2" href="">abc</a>c</span></span></div>';

  Assert.eq('', true, DOM.is(DOM.select('span', 'test'), 'span'));
  Assert.eq('', true, DOM.is(DOM.select('#test2', 'test'), '#test2'));

  DOM.remove('test');
});

UnitTest.test('DOMUtils.getViewPort', () => {
  const wp = DOM.getViewPort();
  Assert.eq('', 0, wp.x);
  Assert.eq('', 0, wp.y);
  Assert.eq('', true, wp.w > 0);
  Assert.eq('', true, wp.h > 0);
});

UnitTest.test('DOMUtils.getRect', () => {
  let r;

  DOM.add(document.body, 'div', { id: 'test' });

  DOM.setStyles('test', { position: 'absolute', left: 100, top: 110, width: 320, height: 240 });
  r = DOM.getRect('test');
  Assert.eq('', 100, Math.round(r.x));
  Assert.eq('', 110, Math.round(r.y));
  Assert.eq('', 320, Math.round(r.w));
  Assert.eq('', 240, Math.round(r.h));

  DOM.setAttrib('test', 'style', '');

  DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:50%;height:240px"></div></div>';
  r = DOM.getRect('test2');
  Assert.eq('', 160, r.w);

  DOM.remove('test');
});

UnitTest.test('DOMUtils.getSize', () => {
  let r;

  DOM.add(document.body, 'div', { id: 'test' });

  DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:50%;height:240px"></div></div>';
  r = DOM.getSize('test2');
  Assert.eq('', 160, r.w);

  DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:100px;height:240px"></div></div>';
  r = DOM.getSize('test2');
  Assert.eq('', 100, r.w);

  DOM.remove('test');
});

// TODO: Add test comments
UnitTest.test('DOMUtils.getNext', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.get('test').innerHTML = '<strong>A</strong><span>B</span><em>C</em>';
  Assert.eq('', 'SPAN', DOM.getNext(DOM.get('test').firstChild, '*').nodeName);
  Assert.eq('', 'EM', DOM.getNext(DOM.get('test').firstChild, 'em').nodeName);
  Assert.eq('', null, DOM.getNext(DOM.get('test').firstChild, 'div'));
  Assert.eq('', null, DOM.getNext(null, 'div'));
  Assert.eq('', 'EM', DOM.getNext(DOM.get('test').firstChild, eqNodeName('EM')).nodeName);

  DOM.remove('test');
});

UnitTest.test('DOMUtils.getPrev', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.get('test').innerHTML = '<strong>A</strong><span>B</span><em>C</em>';
  Assert.eq('', 'SPAN', DOM.getPrev(DOM.get('test').lastChild, '*').nodeName);
  Assert.eq('', 'STRONG', DOM.getPrev(DOM.get('test').lastChild, 'strong').nodeName);
  Assert.eq('', null, DOM.getPrev(DOM.get('test').lastChild, 'div'));
  Assert.eq('', null, DOM.getPrev(null, 'div'));
  Assert.eq('', 'STRONG', DOM.getPrev(DOM.get('test').lastChild, eqNodeName('STRONG')).nodeName);

  DOM.remove('test');
});

UnitTest.test('DOMUtils.loadCSS', () => {
  let c = 0;

  DOM.loadCSS('tinymce/dom/test.css?a=1,tinymce/dom/test.css?a=2,tinymce/dom/test.css?a=3');

  Tools.each(document.getElementsByTagName('link'), (n: HTMLLinkElement) => {
    if (n.href.indexOf('test.css?a=') !== -1 && !n.crossOrigin) {
      c++;
    }
  });

  Assert.eq('', 3, c);
});

UnitTest.test('DOMUtils.loadCSS contentCssCors enabled', () => {
  let c = 0;

  // The crossorigin attribute isn't supported in IE11
  if (Env.ie < 12) {
    return;
  }

  // Create an iframe to load in, so that we are using a different document. Otherwise DOMUtils will fallback to using the default.
  const iframe = DOM.create('iframe', { src: `javascript=''` }) as HTMLIFrameElement;
  DOM.add(document.body, iframe);

  const iframeDoc = iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write('<html><body></body></html>');
  iframeDoc.close();

  const CustomDOM = DOMUtils(iframeDoc, { keep_values: true, schema: Schema(), contentCssCors: true });
  CustomDOM.loadCSS('tinymce/dom/test_cors.css?a=1,tinymce/dom/test_cors.css?a=2,tinymce/dom/test_cors.css?a=3');

  Tools.each(iframeDoc.getElementsByTagName('link'), (n: HTMLLinkElement) => {
    if (n.href.indexOf('test_cors.css?a=') !== -1 && n.crossOrigin === 'anonymous') {
      c++;
    }
  });

  DOM.remove(iframe);

  Assert.eq('', 3, c);
});

UnitTest.test('DOMUtils.insertAfter', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.setHTML('test', '<span id="test2"></span>');
  DOM.insertAfter(DOM.create('br'), 'test2');
  Assert.eq('', 'BR', DOM.get('test2').nextSibling.nodeName);

  DOM.setHTML('test', '<span>test</span><span id="test2"></span><span>test</span>');
  DOM.insertAfter(DOM.create('br'), 'test2');
  Assert.eq('', 'BR', DOM.get('test2').nextSibling.nodeName);

  DOM.remove('test');
});

UnitTest.test('DOMUtils.isBlock', () => {
  Assert.eq('', true, DOM.isBlock(DOM.create('div')));
  Assert.eq('', true, DOM.isBlock('DIV'));
  Assert.eq('', false, DOM.isBlock('SPAN'));
  Assert.eq('', true, DOM.isBlock('div'));
});

UnitTest.test('DOMUtils.remove', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
  DOM.remove('test2', true);
  Assert.eq('', '<span>test</span><span>test2</span>', DOM.get('test').innerHTML.toLowerCase());

  DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
  Assert.eq('', 'SPAN', DOM.remove('test2').nodeName);

  DOM.remove('test');
});

UnitTest.test('DOMUtils.replace', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
  DOM.replace(DOM.create('div', { id: 'test2' }), 'test2', true);
  Assert.eq('', '<span>test</span><span>test2</span>', DOM.get('test2').innerHTML.toLowerCase());

  DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
  DOM.replace(DOM.create('div', { id: 'test2' }), 'test2');
  Assert.eq('', '', DOM.get('test2').innerHTML);

  DOM.remove('test');
});

UnitTest.test('DOMUtils.toHex', () => {
  Assert.eq('', '#00ffff', DOM.toHex('rgb(0, 255, 255)'));
  Assert.eq('', '#ff0000', DOM.toHex('rgb(255, 0, 0)'));
  Assert.eq('', '#0000ff', DOM.toHex('rgb(0, 0, 255)'));
  Assert.eq('', '#0000ff', DOM.toHex('rgb  (  0  , 0  , 255  )  '));
  Assert.eq('', '#0000ff', DOM.toHex('   RGB  (  0  , 0  , 255  )  '));
});

UnitTest.test('DOMUtils.getOuterHTML', () => {
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
  Assert.eq('', '<span id=test2><span>test</span><span>test2</span></span>', DOM.getOuterHTML('test2').toLowerCase().replace(/\"/g, ''));

  DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
  DOM.setOuterHTML('test2', '<div id="test2">123</div>');
  Assert.eq('', '<div id=test2>123</div>', Tools.trim(DOM.getOuterHTML('test2') || '').toLowerCase().replace(/\"/g, ''));

  DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
  DOM.setOuterHTML('test2', '<div id="test2">123</div><div id="test3">abc</div>');
  Assert.eq('', '<div id=test2>123</div><div id=test3>abc</div>', Tools.trim(DOM.get('test').innerHTML).toLowerCase().replace(/>\s+</g, '><').replace(/\"/g, ''));

  DOM.setHTML('test', 'test');
  Assert.eq('', 'test', Tools.trim(DOM.getOuterHTML(DOM.get('test').firstChild as Element)));

  DOM.remove('test');
});

UnitTest.test('DOMUtils.encodeDecode', () => {
  Assert.eq('', '\u00e5\u00e4\u00f6&amp;&lt;&gt;&quot;', DOM.encode('\u00e5\u00e4\u00f6&<>"'));
  Assert.eq('', '\u00e5\u00e4\u00f6&<>"', DOM.decode('&aring;&auml;&ouml;&amp;&lt;&gt;&quot;'));
});

UnitTest.test('DOMUtils.split', () => {
  let point: Element;
  let parent: Element;
  DOM.add(document.body, 'div', { id: 'test' });

  DOM.setHTML('test', '<p><b>text1<span>inner</span>text2</b></p>');
  parent = DOM.select('p', DOM.get('test'))[0];
  point = DOM.select('span', DOM.get('test'))[0];
  DOM.split(parent, point);
  Assert.eq('', '<p><b>text1</b></p><span>inner</span><p><b>text2</b></p>', DOM.get('test').innerHTML.toLowerCase().replace(/\s+/g, ''));

  DOM.setHTML('test', '<p><strong>  &nbsp;  <span></span>cd</strong></p>');
  parent = DOM.select('strong', DOM.get('test'))[0];
  point = DOM.select('span', DOM.get('test'))[0];
  DOM.split(parent, point);
  Assert.eq('TINY-6251: Do not remove spaces containing nbsp', '<p><strong>  &nbsp;  </strong><span></span><strong>cd</strong></p>', DOM.get('test').innerHTML.toLowerCase());

  DOM.setHTML('test', '<ul><li>first line<br><ul><li><span>second</span> <span>line</span></li><li>third line<br></li></ul></li></ul>');
  parent = DOM.select('li:nth-child(1)', DOM.get('test'))[0];
  point = DOM.select('ul li:nth-child(2)', DOM.get('test'))[0];
  DOM.split(parent, point);
  Assert.eq('', '<ul><li>first line<br><ul><li><span>second</span> <span>line</span></li></ul></li><li>third line<br></li></ul>', HtmlUtils.cleanHtml(DOM.get('test').innerHTML));

  DOM.remove('test');
});

UnitTest.test('DOMUtils.nodeIndex', () => {
  DOM.add(document.body, 'div', { id: 'test' }, 'abc<b>abc</b>abc');

  Assert.eq('', 0, DOM.nodeIndex(DOM.get('test').childNodes[0]));
  Assert.eq('', 1, DOM.nodeIndex(DOM.get('test').childNodes[1]));
  Assert.eq('', 2, DOM.nodeIndex(DOM.get('test').childNodes[2]));

  DOM.get('test').insertBefore(DOM.doc.createTextNode('a'), DOM.get('test').firstChild);
  DOM.get('test').insertBefore(DOM.doc.createTextNode('b'), DOM.get('test').firstChild);

  Assert.eq('', 4, DOM.nodeIndex(DOM.get('test').lastChild));
  Assert.eq('', 2, DOM.nodeIndex(DOM.get('test').lastChild, true));

  DOM.remove('test');
});

UnitTest.test('DOMUtils.isEmpty without defined schema', () => {
  DOM.add(document.body, 'div', { id: 'test' }, '');

  const domUtils = DOMUtils(document);

  DOM.setHTML('test', '<hr>');
  Assert.eq('', false, domUtils.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<p><br></p>');
  Assert.eq('', true, domUtils.isEmpty(DOM.get('test')));

  DOM.remove('test');
});

UnitTest.test('DOMUtils.isEmpty', () => {
  DOM.schema = Schema(); // A schema will be added when used within a editor instance
  DOM.add(document.body, 'div', { id: 'test' }, '');

  Assert.eq('', true, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<br />');
  Assert.eq('', true, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<br /><br />');
  Assert.eq('', false, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', 'text');
  Assert.eq('', false, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<span>text</span>');
  Assert.eq('', false, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<span></span>');
  Assert.eq('', true, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<div><span><b></b></span><b></b><em></em></div>');
  Assert.eq('', true, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<div><span><b></b></span><b></b><em>X</em></div>');
  Assert.eq('', false, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<div><span><b></b></span><b></b><em> </em></div>');
  Assert.eq('', true, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<div><span><b></b></span><b></b><em><a name="x"></a></em></div>');
  Assert.eq('', false, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif">');
  Assert.eq('', false, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<span data-mce-bookmark="1"></span>');
  Assert.eq('', false, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<span data-mce-style="color:Red"></span>');
  Assert.eq('', true, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<div><!-- comment --></div>');
  Assert.eq('', false, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<span data-mce-bogus="1"></span>');
  Assert.eq('', true, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<span data-mce-bogus="1">a</span>');
  Assert.eq('', false, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<span data-mce-bogus="all">a</span>');
  Assert.eq('', true, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<span data-mce-bogus="all">a</span>b');
  Assert.eq('', false, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<code> </code>');
  Assert.eq('', false, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<pre> </pre>');
  Assert.eq('', false, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<code></code>');
  Assert.eq('', false, DOM.isEmpty(DOM.get('test')));

  DOM.setHTML('test', '<pre></pre>');
  Assert.eq('', false, DOM.isEmpty(DOM.get('test')));

  DOM.remove('test');
});

UnitTest.test('DOMUtils.isEmpty with list of elements considered non-empty', () => {
  const elm = DOM.create('p', null, '<img>');
  Assert.eq('', DOM.isEmpty(elm, { img: true }), false);
});

UnitTest.test('DOMUtils.isEmpty on pre', () => {
  const elm = DOM.create('pre', null, '  ');
  Assert.eq('', DOM.isEmpty(elm), false);
});

UnitTest.test('DOMUtils.isEmpty with list of elements considered non-empty without schema', () => {
  const domWithoutSchema = DOMUtils(document, { keep_values: true });

  const elm = domWithoutSchema.create('p', null, '<img>');
  Assert.eq('', domWithoutSchema.isEmpty(elm, { img: true }), false);
});

UnitTest.test('DOMUtils.isEmpty on P with BR in EM', () => {
  const elm = DOM.create('p', null, '<em><br></em>');
  Assert.eq('', true, DOM.isEmpty(elm));
});

UnitTest.test('DOMUtils.isEmpty on P with two BR in EM', () => {
  const elm = DOM.create('p', null, '<em><br><br></em>');
  Assert.eq('', DOM.isEmpty(elm), false);
});

UnitTest.test('DOMUtils.bind/unbind/fire', () => {
  let count = 0;

  DOM.bind(document, 'click', () => {
    count++;
  });
  DOM.fire(document, 'click');
  DOM.unbind(document, 'click');
  Assert.eq('', 1, count);

  count = 0;
  DOM.bind([ document, window ], 'click', (e) => {
    e.stopPropagation();
    count++;
  });
  DOM.fire(document, 'click');
  DOM.fire(window, 'click');
  DOM.unbind([ document, window ], 'click');
  Assert.eq('', 2, count);

  count = 0;
  DOM.fire(document, 'click');
  DOM.fire(window, 'click');
  Assert.eq('', 0, count);
});

UnitTest.test('DOMUtils.get - by id in head', () => {
  const DOM = DOMUtils(document, { keep_values: true, schema: Schema() });

  const meta: HTMLMetaElement = document.createElement('meta');
  meta.setAttribute('id', 'myid');
  document.head.appendChild(meta);

  Assert.eq('get meta', meta, DOM.get('myid'), Testable.tStrict);
  document.head.removeChild(meta);
});

UnitTest.test('DOMUtils.get - does not find element by name in head', () => {
  const DOM = DOMUtils(document, { keep_values: true, schema: Schema() });

  const meta: HTMLMetaElement = document.createElement('meta');
  meta.setAttribute('name', 'myname');
  document.head.appendChild(meta);

  Assert.eq('get meta', null, DOM.get('myname'), Testable.tStrict);
  document.head.removeChild(meta);
});

UnitTest.test('DOMUtils.get - does not find element by name in body', () => {
  const DOM = DOMUtils(document, { keep_values: true, schema: Schema() });

  const meta: HTMLMetaElement = document.createElement('meta');
  meta.setAttribute('name', 'myname');
  document.body.appendChild(meta);

  Assert.eq('get meta', null, DOM.get('myname'), Testable.tStrict);
  document.body.removeChild(meta);
});

UnitTest.test('DOMUtils.get - finds element by id in body, not element by name in head', () => {
  const DOM = DOMUtils(document, { keep_values: true, schema: Schema() });

  const meta = document.createElement('meta');
  meta.setAttribute('name', 'myname');
  document.head.appendChild(meta);

  const div = document.createElement('div');
  div.setAttribute('id', 'myname');
  document.body.appendChild(div);

  Assert.eq('get div', div, DOM.get('myname'), Testable.tStrict);
  document.head.removeChild(meta);
  document.body.removeChild(div);
});

UnitTest.test('DOMUtils.get - returns element', () => {
  const DOM = DOMUtils(document, { keep_values: true, schema: Schema() });
  const e = document.createElement('div');
  Assert.eq('get', e, DOM.get(e), Testable.tStrict);
});

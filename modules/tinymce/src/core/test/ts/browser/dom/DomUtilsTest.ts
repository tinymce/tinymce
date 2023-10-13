import { context, describe, it } from '@ephox/bedrock-client';
import { Type } from '@ephox/katamari';
import { ContentEditable, Hierarchy, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Schema from 'tinymce/core/api/html/Schema';
import Tools from 'tinymce/core/api/util/Tools';

import * as HtmlUtils from '../../module/test/HtmlUtils';

describe('browser.tinymce.core.dom.DOMUtilsTest', () => {
  const DOM = DOMUtils(document, { keep_values: true, schema: Schema() });

  const getTestElement = (id: string = 'test') =>
    DOM.get(id) as HTMLElement;

  const createSvgElement = (name: string) => document.createElementNS('http://www.w3.org/2000/svg', name);

  it('parseStyle', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    const dom = DOMUtils(document, {
      keep_values: true,
      url_converter: (u) => {
        return 'X' + u + 'Y';
      }
    });

    assert.equal(dom.serializeStyle(dom.parseStyle('border: 1px solid red; color: green')), 'border: 1px solid red; color: green;', 'incorrect parsing');

    assert.equal(dom.serializeStyle(dom.parseStyle('border: 1px solid rgb(0, 255, 255); color: green')), 'border: 1px solid rgb(0, 255, 255); color: green;', 'incorrect parsing');

    assert.equal(dom.serializeStyle(
      dom.parseStyle('border-top: 1px solid red; border-left: 1px solid red; border-bottom: 1px solid red; border-right: 1px solid red;')
    ), 'border: 1px solid red;', 'incorrect parsing');

    assert.equal(dom.serializeStyle(
      dom.parseStyle('border-width: 1pt 1pt 1pt 1pt; border-style: none none none none; border-color: black black black black;')
    ), 'border: 1pt none black;', 'incorrect parsing');

    assert.equal(dom.serializeStyle(
      dom.parseStyle('border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;')
    ), 'border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;', 'incorrect parsing');

    assert.equal(dom.serializeStyle(dom.parseStyle('background: transparent url(test.gif);')), `background: transparent url('Xtest.gifY');`, 'incorrect parsing');

    assert.equal(dom.serializeStyle(dom.parseStyle('background: transparent url(http://www.site.com/test.gif?a=1&b=2);')), `background: transparent url('Xhttp://www.site.com/test.gif?a=1&b=2Y');`, 'incorrect parsing');

    dom.setHTML('test', '<span id="test2" style="   margin-left: 1px;    margin-top: 1px;   margin-right: 1px;   margin-bottom: 1px   "></span>');
    assert.equal(dom.getAttrib('test2', 'style'), 'margin: 1px;', 'incorrect attribute value');

    dom.setHTML('test', '<span id="test2" style="background-image: url(test.gif);"></span>');
    assert.equal(dom.getAttrib('test2', 'style'), `background-image: url('Xtest.gifY');`, 'incorrect attribute value');

    // dom.get('test').innerHTML = '<span id="test2" style="border: 1px solid #00ff00"></span>';
    // equal(dom.getAttrib('test2', 'style'), Env.ue && !window.getSelection ?
    // 'border: #00ff00 1px solid;' : 'border: 1px solid #00ff00;'); // IE has a separate output

    (dom.get('test') as HTMLElement).innerHTML = '<span id="test2" style="background-image: url(http://www.site.com/test.gif);"></span>';
    assert.equal(dom.getAttrib('test2', 'style'), `background-image: url('Xhttp://www.site.com/test.gifY');`, 'incorrect attribute value');

    DOM.remove('test');
  });

  it('addClass', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    getTestElement().className = '';
    DOM.addClass('test', 'abc');
    assert.equal(getTestElement().className, 'abc', 'incorrect classname');

    DOM.addClass('test', '123');
    assert.equal(getTestElement().className, 'abc 123', 'incorrect classname');

    getTestElement().innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
    DOM.addClass(DOM.select('span', 'test'), 'abc');
    assert.equal((getTestElement('test2')).className, 'abc', 'incorrect classname');
    assert.equal((getTestElement('test3')).className, 'abc', 'incorrect classname');
    assert.equal((getTestElement('test4')).className, 'abc', 'incorrect classname');
    getTestElement().innerHTML = '';

    DOM.remove('test');
  });

  it('removeClass', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    getTestElement().className = 'abc 123 xyz';
    DOM.removeClass('test', '123');
    assert.equal(getTestElement().className, 'abc xyz', 'incorrect classname');

    getTestElement().innerHTML = (
      '<span id="test2" class="test1"></span><span id="test3" class="test test1 test"></span><span id="test4" class="test1 test"></span>'
    );
    DOM.removeClass(DOM.select('span', 'test'), 'test1');
    assert.equal((getTestElement('test2')).className, '', 'incorrect classname');
    assert.equal((getTestElement('test3')).className, 'test', 'incorrect classname');
    assert.equal((getTestElement('test4')).className, 'test', 'incorrect classname');

    getTestElement().innerHTML = '<span id="test2" class="test"></span>';
    DOM.removeClass('test2', 'test');
    assert.equal(getTestElement().innerHTML, '<span id="test2"></span>', 'incorrect classname');

    DOM.remove('test');
  });

  it('hasClass', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    getTestElement().className = 'abc 123 xyz';
    assert.isTrue(DOM.hasClass('test', 'abc'), 'incorrect hasClass result');
    assert.isTrue(DOM.hasClass('test', '123'), 'incorrect hasClass result');
    assert.isTrue(DOM.hasClass('test', 'xyz'), 'incorrect hasClass result');
    assert.isFalse(DOM.hasClass('test', 'aaa'), 'incorrect hasClass result');

    getTestElement().className = 'abc';
    assert.isTrue(DOM.hasClass('test', 'abc'), 'incorrect hasClass result');

    getTestElement().className = 'aaa abc';
    assert.isTrue(DOM.hasClass('test', 'abc'), 'incorrect hasClass result');

    getTestElement().className = 'abc aaa';
    assert.isTrue(DOM.hasClass('test', 'abc'), 'incorrect hasClass result');

    DOM.remove('test');
  });

  it('add', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    DOM.add('test', 'span', { class: 'abc 123' }, 'content <b>abc</b>');
    let e = getTestElement().getElementsByTagName('span')[0];
    assert.equal(e.className, 'abc 123', 'incorrect className');
    assert.equal(e.innerHTML.toLowerCase(), 'content <b>abc</b>', 'incorrect innerHTML');
    DOM.remove(e);

    DOM.add('test', 'span', { class: 'abc 123' });
    e = getTestElement().getElementsByTagName('span')[0];
    assert.equal(e.className, 'abc 123', 'incorrect classname');
    DOM.remove(e);

    DOM.add('test', 'span');
    e = getTestElement().getElementsByTagName('span')[0];
    assert.equal(e.nodeName, 'SPAN', 'incorrect nodeName');
    DOM.remove(e);

    getTestElement().innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
    DOM.add([ 'test2', 'test3', 'test4' ], 'span', { class: 'abc 123' });
    assert.equal(DOM.select('span', 'test').length, 6, 'incorrect length');

    DOM.remove('test');
  });

  it('create', () => {
    const e = DOM.create('span', { class: 'abc 123' }, 'content <b>abc</b>');

    assert.equal(e.nodeName, 'SPAN', 'incorrect nodeName');
    assert.equal(e.className, 'abc 123', 'incorrect className');
    assert.equal(e.innerHTML.toLowerCase(), 'content <b>abc</b>', 'innerHTML was wrong');
  });

  it('createHTML', () => {
    assert.equal(DOM.createHTML('span', {
      id: 'id1',
      class: 'abc 123'
    }, 'content <b>abc</b>'), '<span id="id1" class="abc 123">content <b>abc</b></span>');
    assert.equal(DOM.createHTML('span', { id: 'id1', class: 'abc 123' }), '<span id="id1" class="abc 123"></span>');
    assert.equal(DOM.createHTML('span', { id: null, class: undefined } as any), '<span></span>');
    assert.equal(DOM.createHTML('span'), '<span></span>');
    assert.equal(DOM.createHTML('span', {}, 'content <b>abc</b>'), '<span>content <b>abc</b></span>');
    assert.equal(DOM.createHTML('img', {}), '<img />');
  });

  it('uniqueId', () => {
    assert.equal(DOM.uniqueId(), 'mce_0');
    assert.equal(DOM.uniqueId(), 'mce_1');
    assert.equal(DOM.uniqueId(), 'mce_2');
  });

  it('showHide', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    DOM.show('test');
    assert.equal(getTestElement().style.display, '');
    assert.isFalse(DOM.isHidden('test'));

    DOM.hide('test');
    assert.equal(getTestElement().style.display, 'none');
    assert.isTrue(DOM.isHidden('test'));

    // Cleanup
    DOM.setAttrib('test', 'style', '');

    DOM.remove('test');
  });

  it('select', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    DOM.setHTML('test', '<div>test 1</div><div>test 2 <div>test 3</div></div><div>test 4</div>');
    assert.equal(DOM.select('div', 'test').length, 4);
    assert.isTrue(DOM.select('div', 'test').reverse !== undefined);

    DOM.setHTML('test', '<div class="test1 test2 test3">test 1</div><div class="test2">test 2 <div>test 3</div></div><div>test 4</div>');
    assert.equal(DOM.select('div.test2', 'test').length, 2);

    DOM.remove('test');
  });

  it('is', () => {
    DOM.add(document.body, 'div', { id: 'test' });
    DOM.setHTML('test', '<div id="textX" class="test">test 1</div>');

    assert.isTrue(DOM.is(DOM.get('textX'), 'div'));
    assert.isTrue(DOM.is(DOM.get('textX'), 'div#textX.test'));
    assert.isFalse(DOM.is(DOM.get('textX'), 'div#textX2'));
    assert.isFalse(DOM.is(null, 'div#textX2'));

    getTestElement().innerHTML = '<div><span class="test">ab<span><a id="test2" href="">abc</a>c</span></span></div>';

    assert.isTrue(DOM.is(DOM.select('span', 'test'), 'span'));
    assert.isTrue(DOM.is(DOM.select('#test2', 'test'), '#test2'));

    DOM.remove('test');
  });

  it('encode', () => {
    assert.equal(DOM.encode(`abc<>"&'\u00e5\u00e4\u00f6`), 'abc&lt;&gt;&quot;&amp;&#39;\u00e5\u00e4\u00f6');
  });

  it('setGetAttrib', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    DOM.setAttrib('test', 'class', 'test 123');
    assert.equal(DOM.getAttrib('test', 'class'), 'test 123');

    DOM.setAttrib('test', 'src', 'url');
    assert.equal(DOM.getAttrib('test', 'src'), 'url');
    assert.equal(DOM.getAttrib('test', 'data-mce-src'), 'url');
    assert.equal(DOM.getAttrib('test', 'abc'), '');

    DOM.setAttribs('test', { class: '123', title: 'abc' });
    assert.equal(DOM.getAttrib('test', 'class'), '123');
    assert.equal(DOM.getAttrib('test', 'title'), 'abc');

    DOM.setAttribs('test', {});
    assert.equal(DOM.getAttrib('test', 'class'), '123');
    assert.equal(DOM.getAttrib('test', 'title'), 'abc');

    const dom = DOMUtils(document, {
      keep_values: true, url_converter: (u, n) => {
        return '&<>"' + u + '&<>"' + n;
      }
    });

    dom.setAttribs('test', { src: '123', href: 'abc' });
    assert.equal(DOM.getAttrib('test', 'src'), '&<>"123&<>"src');
    assert.equal(DOM.getAttrib('test', 'href'), '&<>"abc&<>"href');

    const nonElement = document as unknown as Element;
    assert.equal(DOM.getAttrib(nonElement, 'test'), '');
    assert.equal(DOM.getAttrib(nonElement, 'test', ''), '');
    assert.equal(DOM.getAttrib(nonElement, 'test', 'x'), 'x');

    const svg = createSvgElement('svg');
    DOM.setAttrib(svg, 'class', 'foo');
    assert.equal(DOM.getAttrib(svg, 'class'), 'foo');

    DOM.remove('test');
  });

  it('setGetAttrib on null', () => {
    assert.equal(DOM.getAttrib(null, 'test'), '');
    DOM.setAttrib(null, 'test', null);
  });

  it('getContentEditable', () => {
    const test = DOM.add(document.body, 'div', { id: 'test' });

    test.innerHTML = `
      <span contenteditable="false"></span>
      <span contenteditable="true"></span>
      <span></span>
      <svg></svg>
    `;
    const elms = test.children;

    assert.equal(DOM.getContentEditable(elms[0]), 'false');
    assert.equal(DOM.getContentEditable(elms[1]), 'true');
    assert.equal(DOM.getContentEditable(elms[2]), null, 'inherit counts as null');
    assert.equal(DOM.getContentEditable(elms[3]), null, 'We can not get the contentEditable state from SVGElement since it does not have that property');

    DOM.remove('test');
  });

  it('getAttribs', () => {
    const check = (obj: NamedNodeMap | Attr[], val: string) => {
      let count = 0;

      const values = val.split(',');

      Tools.each(obj, (o) => {
        if (Tools.inArray(values, o.nodeName.toLowerCase()) !== -1 && o.specified) {
          count++;
        }
      });

      return count === obj.length;
    };

    DOM.add(document.body, 'div', { id: 'test' });

    getTestElement().innerHTML = '<span id="test2" class="test"></span>';
    assert.isTrue(check(DOM.getAttribs('test2'), 'id,class'));

    getTestElement().innerHTML = '<input id="test2" type="checkbox" name="test" value="1" disabled readonly checked></span>';
    assert.isTrue(check(DOM.getAttribs('test2'), 'id,type,name,value,disabled,readonly,checked'));

    DOM.remove('test');
  });

  it('setGetStyles', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    DOM.setStyle('test', 'font-size', '20px');
    assert.equal(DOM.getStyle('test', 'font-size'), '20px');

    DOM.setStyle('test', 'fontSize', '21px');
    assert.equal(DOM.getStyle('test', 'fontSize'), '21px');

    DOM.setStyles('test', { fontSize: '22px', display: 'inline' });
    assert.equal(DOM.getStyle('test', 'fontSize'), '22px');
    assert.equal(DOM.getStyle('test', 'display'), 'inline');

    DOM.setStyle('test', 'fontSize', 23);
    assert.equal(DOM.getStyle('test', 'fontSize'), '23px');

    DOM.setStyle('test', 'fontSize', 23);
    DOM.setStyle('test', 'fontSize', '');
    assert.equal(DOM.getStyle('test', 'fontSize'), '');

    DOM.setStyle('test', 'fontSize', 23);
    DOM.setStyle('test', 'fontSize', null);
    assert.equal(DOM.getStyle('test', 'fontSize'), '');

    DOM.setAttrib('test', 'style', '');
    assert.isUndefined(DOM.getStyle(null, 'fontSize'));

    DOM.remove('test');
  });

  it('setStyle/getStyle on a SVG element', () => {
    const svg = createSvgElement('svg');
    DOM.setStyle(svg, 'color', 'red');
    assert.equal(DOM.getStyle(svg, 'color'), 'red');
  });

  it('getPos', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    DOM.setStyles('test', { position: 'absolute', left: 100, top: 110 });
    assert.equal(Math.round(DOM.getPos('test').x), 100);
    assert.equal(Math.round(DOM.getPos('test').y), 110);

    DOM.setAttrib('test', 'style', '');

    DOM.remove('test');
  });

  const eqNodeName = (name: string) => (n: Node) => n.nodeName === name;

  it('getParent', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    getTestElement().innerHTML = '<div><span>ab<a id="test2" href="">abc</a>c</span></div>';

    assert.equal(DOM.getParent('test2', eqNodeName('SPAN'))?.nodeName, 'SPAN');
    assert.equal(DOM.getParent('test2', eqNodeName('BODY'))?.nodeName, 'BODY');
    assert.isNull(DOM.getParent('test2', eqNodeName('BODY'), document.body));
    assert.isNull(DOM.getParent('test2', eqNodeName('X')));
    assert.equal(DOM.getParent('test2', 'SPAN')?.nodeName, 'SPAN');
    assert.isNull(DOM.getParent('test2', 'body', getTestElement()));

    getTestElement().innerHTML = '';

    DOM.remove('test');
  });

  it('getParents', () => {
    DOM.add(document.body, 'div', { id: 'test' });
    getTestElement().innerHTML = '<div><span class="test">ab<span><a id="test2" href="">abc</a>c</span></span></div>';

    assert.lengthOf(DOM.getParents('test2', eqNodeName('SPAN')), 2);
    assert.lengthOf(DOM.getParents('test2', 'span'), 2);
    assert.lengthOf(DOM.getParents('test2', 'span.test'), 1);
    assert.lengthOf(DOM.getParents('test2', 'body', getTestElement()), 0);

    // getParents should stop at DocumentFragment
    const frag = document.createDocumentFragment();
    const inputElm = document.createElement('input');
    frag.appendChild(inputElm);
    assert.lengthOf(DOM.getParents(inputElm, (d) => d.nodeName === '#document-fragment'), 0);

    DOM.remove('test');
  });

  it('getViewPort', () => {
    const wp = DOM.getViewPort();
    assert.equal(wp.x, 0);
    assert.equal(wp.y, 0);
    assert.isAbove(wp.w, 0);
    assert.isAbove(wp.h, 0);
  });

  it('getRect', () => {
    let r;

    DOM.add(document.body, 'div', { id: 'test' });

    DOM.setStyles('test', { position: 'absolute', left: 100, top: 110, width: 320, height: 240 });
    r = DOM.getRect('test');
    assert.equal(Math.round(r.x), 100);
    assert.equal(Math.round(r.y), 110);
    assert.equal(Math.round(r.w), 320);
    assert.equal(Math.round(r.h), 240);

    DOM.setAttrib('test', 'style', '');

    getTestElement().innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:50%;height:240px"></div></div>';
    r = DOM.getRect('test2');
    assert.equal(r.w, 160);

    DOM.remove('test');
  });

  it('getSize', () => {
    let r: { w: number; h: number };

    DOM.add(document.body, 'div', { id: 'test' });

    getTestElement().innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:50%;height:240px"></div></div>';
    r = DOM.getSize('test2');
    assert.equal(r.w, 160);

    getTestElement().innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:100px;height:240px"></div></div>';
    r = DOM.getSize('test2');
    assert.equal(r.w, 100);

    DOM.remove('test');
  });

  // TODO: Add test comments
  it('getNext', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    getTestElement().innerHTML = '<strong>A</strong><span>B</span><em>C</em>';
    assert.equal(DOM.getNext(getTestElement().firstChild as HTMLElement, '*')?.nodeName, 'SPAN');
    assert.equal(DOM.getNext(getTestElement().firstChild as HTMLElement, 'em')?.nodeName, 'EM');
    assert.isNull(DOM.getNext(getTestElement().firstChild as HTMLElement, 'div'));
    assert.isNull(DOM.getNext(null, 'div'));
    assert.equal(DOM.getNext(getTestElement().firstChild as HTMLElement, eqNodeName('EM'))?.nodeName, 'EM');

    DOM.remove('test');
  });

  it('getPrev', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    getTestElement().innerHTML = '<strong>A</strong><span>B</span><em>C</em>';
    assert.equal(DOM.getPrev(getTestElement().lastChild as HTMLElement, '*')?.nodeName, 'SPAN');
    assert.equal(DOM.getPrev(getTestElement().lastChild as HTMLElement, 'strong')?.nodeName, 'STRONG');
    assert.isNull(DOM.getPrev(getTestElement().lastChild as HTMLElement, 'div'));
    assert.isNull(DOM.getPrev(null, 'div'));
    assert.equal(DOM.getPrev(getTestElement().lastChild as HTMLElement, eqNodeName('STRONG'))?.nodeName, 'STRONG');

    DOM.remove('test');
  });

  it('loadCSS', () => {
    let c = 0;

    DOM.loadCSS('tinymce/dom/test.css?a=1,tinymce/dom/test.css?a=2,tinymce/dom/test.css?a=3');

    Tools.each(document.getElementsByTagName('link'), (n) => {
      if (n.href.indexOf('test.css?a=') !== -1 && !n.crossOrigin) {
        c++;
      }
    });

    assert.equal(c, 3);
  });

  it('loadCSS contentCssCors enabled', () => {
    let c = 0;

    // Create an iframe to load in, so that we are using a different document. Otherwise DOMUtils will fallback to using the default.
    const iframe = DOM.create('iframe', { src: `javascript=''` });
    DOM.add(document.body, iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (Type.isNullable(iframeDoc)) {
      assert.fail('Iframe document is not available');
      return;
    }

    iframeDoc.open();
    iframeDoc.write('<html><body></body></html>');
    iframeDoc.close();

    const CustomDOM = DOMUtils(iframeDoc, { keep_values: true, schema: Schema(), contentCssCors: true });
    CustomDOM.loadCSS('tinymce/dom/test_cors.css?a=1,tinymce/dom/test_cors.css?a=2,tinymce/dom/test_cors.css?a=3');

    Tools.each(iframeDoc.getElementsByTagName('link'), (n) => {
      if (n.href.indexOf('test_cors.css?a=') !== -1 && n.crossOrigin === 'anonymous') {
        c++;
      }
    });

    DOM.remove(iframe);

    assert.equal(c, 3);
  });

  it('insertAfter', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    DOM.setHTML('test', '<span id="test2"></span>');
    DOM.insertAfter(DOM.create('br'), 'test2');
    assert.equal(DOM.get('test2')?.nextSibling?.nodeName, 'BR');

    DOM.setHTML('test', '<span>test</span><span id="test2"></span><span>test</span>');
    DOM.insertAfter(DOM.create('br'), 'test2');
    assert.equal(DOM.get('test2')?.nextSibling?.nodeName, 'BR');

    DOM.remove('test');
  });

  it('isBlock', () => {
    assert.isTrue(DOM.isBlock(DOM.create('div')));
    assert.isTrue(DOM.isBlock('DIV'));
    assert.isFalse(DOM.isBlock('SPAN'));
    assert.isTrue(DOM.isBlock('div'));
    assert.isFalse(DOM.isBlock('a'), 'Anchor name should not be block');
    assert.isTrue(DOM.isBlock(DOM.create('a', { 'data-mce-block': 'true' } )), 'Anchor with data-mce-block should be block');
    assert.isFalse(DOM.isBlock(DOM.create('a')), 'Anchor without data-mce-block should not be block');
  });

  it('remove', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
    DOM.remove('test2', true);
    assert.equal(getTestElement().innerHTML.toLowerCase(), '<span>test</span><span>test2</span>');

    DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
    assert.equal((DOM.remove('test2') as Node).nodeName, 'SPAN');

    DOM.remove('test');
  });

  it('replace', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
    DOM.replace(DOM.create('div', { id: 'test2' }), 'test2', true);
    assert.equal(DOM.get('test2')?.innerHTML.toLowerCase(), '<span>test</span><span>test2</span>');

    DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
    DOM.replace(DOM.create('div', { id: 'test2' }), 'test2');
    assert.equal(DOM.get('test2')?.innerHTML, '');

    DOM.remove('test');
  });

  it('getOuterHTML', () => {
    DOM.add(document.body, 'div', { id: 'test' });

    DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
    assert.equal(DOM.getOuterHTML('test2').toLowerCase().replace(/\"/g, ''), '<span id=test2><span>test</span><span>test2</span></span>');

    DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
    DOM.setOuterHTML('test2', '<div id="test2">123</div>');
    assert.equal(Tools.trim(DOM.getOuterHTML('test2') || '').toLowerCase().replace(/\"/g, ''), '<div id=test2>123</div>');

    DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
    DOM.setOuterHTML('test2', '<div id="test2">123</div><div id="test3">abc</div>');
    assert.equal(Tools.trim(getTestElement().innerHTML).toLowerCase().replace(/>\s+</g, '><').replace(/\"/g, ''), '<div id=test2>123</div><div id=test3>abc</div>');

    DOM.setHTML('test', 'test');
    assert.equal(Tools.trim(DOM.getOuterHTML(getTestElement().firstChild as Element)), 'test');

    DOM.remove('test');
  });

  it('encodeDecode', () => {
    assert.equal(DOM.encode('\u00e5\u00e4\u00f6&<>"'), '\u00e5\u00e4\u00f6&amp;&lt;&gt;&quot;');
    assert.equal(DOM.decode('&aring;&auml;&ouml;&amp;&lt;&gt;&quot;'), '\u00e5\u00e4\u00f6&<>"');
  });

  it('split', () => {
    let point: Element;
    let parent: Element;
    DOM.add(document.body, 'div', { id: 'test' });

    DOM.setHTML('test', '<p><b>text1<span>inner</span>text2</b></p>');
    parent = DOM.select('p', getTestElement())[0];
    point = DOM.select('span', getTestElement())[0];
    DOM.split(parent, point);
    assert.equal(getTestElement().innerHTML.toLowerCase().replace(/\s+/g, ''), '<p><b>text1</b></p><span>inner</span><p><b>text2</b></p>');

    DOM.setHTML('test', '<p><strong>  &nbsp;  <span></span>cd</strong></p>');
    parent = DOM.select('strong', getTestElement())[0];
    point = DOM.select('span', getTestElement())[0];
    DOM.split(parent, point);
    assert.equal(getTestElement().innerHTML.toLowerCase(), '<p><strong>  &nbsp;  </strong><span></span><strong>cd</strong></p>', 'TINY-6251: Do not remove spaces containing nbsp');

    DOM.setHTML('test', '<ul><li>first line<br><ul><li><span>second</span> <span>line</span></li><li>third line<br></li></ul></li></ul>');
    parent = DOM.select('li:nth-child(1)', getTestElement())[0];
    point = DOM.select('ul li:nth-child(2)', getTestElement())[0];
    DOM.split(parent, point);
    assert.equal(HtmlUtils.cleanHtml(getTestElement().innerHTML), '<ul><li>first line<br><ul><li><span>second</span> <span>line</span></li></ul></li><li>third line<br></li></ul>');

    DOM.setHTML('test', '<p><b>&nbsp; <span>inner</span>text2</b></p>');
    parent = DOM.select('p', getTestElement())[0];
    point = DOM.select('span', getTestElement())[0];
    DOM.split(parent, point);
    assert.equal(HtmlUtils.cleanHtml(getTestElement().innerHTML), '<p><b>&nbsp; </b></p><span>inner</span><p><b>text2</b></p>');

    DOM.setHTML('test', '<p><b><a id="anchor"></a><span>inner</span>text2</b></p>');
    parent = DOM.select('p', getTestElement())[0];
    point = DOM.select('span', getTestElement())[0];
    DOM.split(parent, point);
    assert.equal(HtmlUtils.cleanHtml(getTestElement().innerHTML), '<p><b><a id="anchor"></a></b></p><span>inner</span><p><b>text2</b></p>');

    DOM.setHTML('test', '<p>text<span style="text-decoration: underline;"> <span>t</span></span>ext</p>');
    parent = DOM.select('span', getTestElement())[0];
    point = DOM.select('span', getTestElement())[1];
    DOM.split(parent, point);
    assert.equal(getTestElement().innerHTML, '<p>text<span style="text-decoration: underline;"> </span><span>t</span>ext</p>', 'TINY-6268: Do not remove spaces at start of split');

    DOM.setHTML('test', '<p>tex<span style="text-decoration: underline;"><span>t</span> </span>text</p>');
    parent = DOM.select('span', getTestElement())[0];
    point = DOM.select('span', getTestElement())[1];
    DOM.split(parent, point);
    assert.equal(getTestElement().innerHTML, '<p>tex<span>t</span><span style="text-decoration: underline;"> </span>text</p>', 'TINY-6268: Do not remove spaces at end of split');

    DOM.remove('test');
  });

  it('nodeIndex', () => {
    DOM.add(document.body, 'div', { id: 'test' }, 'abc<b>abc</b>abc');

    assert.equal(DOM.nodeIndex(getTestElement().childNodes[0]), 0);
    assert.equal(DOM.nodeIndex(getTestElement().childNodes[1]), 1);
    assert.equal(DOM.nodeIndex(getTestElement().childNodes[2]), 2);

    getTestElement().insertBefore(DOM.doc.createTextNode('a'), getTestElement().firstChild);
    getTestElement().insertBefore(DOM.doc.createTextNode('b'), getTestElement().firstChild);

    assert.equal(DOM.nodeIndex(getTestElement().lastChild as Text), 4);
    assert.equal(DOM.nodeIndex(getTestElement().lastChild as Text, true), 2);

    DOM.remove('test');
  });

  it('isEmpty without defined schema', () => {
    DOM.add(document.body, 'div', { id: 'test' }, '');

    const domUtils = DOMUtils(document);

    DOM.setHTML('test', '<hr>');
    assert.isFalse(domUtils.isEmpty(getTestElement()));

    DOM.setHTML('test', '<p><br></p>');
    assert.isTrue(domUtils.isEmpty(getTestElement()));

    DOM.remove('test');
  });

  it('isEmpty', () => {
    DOM.schema = Schema(); // A schema will be added when used within a editor instance
    DOM.add(document.body, 'div', { id: 'test' }, '');

    assert.isTrue(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<br />');
    assert.isTrue(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<br /><br />');
    assert.isFalse(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', 'text');
    assert.isFalse(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<span>text</span>');
    assert.isFalse(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<span></span>');
    assert.isTrue(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<div><span><b></b></span><b></b><em></em></div>');
    assert.isTrue(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<div><span><b></b></span><b></b><em>X</em></div>');
    assert.isFalse(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<div><span><b></b></span><b></b><em> </em></div>');
    assert.isTrue(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<div><span><b></b></span><b></b><em><a name="x"></a></em></div>');
    assert.isFalse(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif">');
    assert.isFalse(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<span data-mce-bookmark="1"></span>');
    assert.isFalse(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<span data-mce-style="color:Red"></span>');
    assert.isTrue(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<div><!-- comment --></div>');
    assert.isFalse(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<span data-mce-bogus="1"></span>');
    assert.isTrue(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<span data-mce-bogus="1">a</span>');
    assert.isFalse(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<span data-mce-bogus="all">a</span>');
    assert.isTrue(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<span data-mce-bogus="all">a</span>b');
    assert.isFalse(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<code> </code>');
    assert.isFalse(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<pre> </pre>');
    assert.isFalse(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<code></code>');
    assert.isFalse(DOM.isEmpty(getTestElement()));

    DOM.setHTML('test', '<pre></pre>');
    assert.isFalse(DOM.isEmpty(getTestElement()));

    DOM.remove('test');
  });

  it('isEmpty with list of elements considered non-empty', () => {
    const elm = DOM.create('p', {}, '<img>');
    assert.isFalse(DOM.isEmpty(elm, { img: true }));
  });

  it('isEmpty on pre', () => {
    const elm = DOM.create('pre', {}, '  ');
    assert.isFalse(DOM.isEmpty(elm));
  });

  it('isEmpty with list of elements considered non-empty without schema', () => {
    const domWithoutSchema = DOMUtils(document, { keep_values: true });

    const elm = domWithoutSchema.create('p', {}, '<img>');
    assert.isFalse(domWithoutSchema.isEmpty(elm, { img: true }));
  });

  it('isEmpty on P with BR in EM', () => {
    const elm = DOM.create('p', {}, '<em><br></em>');
    assert.isTrue(DOM.isEmpty(elm));
  });

  it('isEmpty on P with two BR in EM', () => {
    const elm = DOM.create('p', {}, '<em><br><br></em>');
    assert.equal(false, DOM.isEmpty(elm));
  });

  it('bind/unbind/fire', () => {
    let count = 0;

    DOM.bind(document, 'click', () => {
      count++;
    });
    DOM.dispatch(document, 'click');
    DOM.unbind(document, 'click');
    assert.equal(count, 1);

    count = 0;
    DOM.bind([ document, window ], 'click', (e) => {
      e.stopPropagation();
      count++;
    });
    DOM.dispatch(document, 'click');
    DOM.dispatch(window, 'click');
    DOM.unbind([ document, window ], 'click');
    assert.equal(count, 2);

    count = 0;
    DOM.dispatch(document, 'click');
    DOM.dispatch(window, 'click');
    assert.equal(count, 0);
  });

  context('get', () => {
    it('by id in head', () => {
      const DOM = DOMUtils(document, { keep_values: true, schema: Schema() });

      const meta: HTMLMetaElement = document.createElement('meta');
      meta.setAttribute('id', 'myid');
      document.head.appendChild(meta);

      assert.strictEqual(DOM.get('myid'), meta, 'get meta');
      document.head.removeChild(meta);
    });

    it('does not find element by name in head', () => {
      const DOM = DOMUtils(document, { keep_values: true, schema: Schema() });

      const meta: HTMLMetaElement = document.createElement('meta');
      meta.setAttribute('name', 'myname');
      document.head.appendChild(meta);

      assert.isNull(DOM.get('myname'), 'get meta');
      document.head.removeChild(meta);
    });

    it('does not find element by name in body', () => {
      const DOM = DOMUtils(document, { keep_values: true, schema: Schema() });

      const meta: HTMLMetaElement = document.createElement('meta');
      meta.setAttribute('name', 'myname');
      document.body.appendChild(meta);

      assert.isNull(DOM.get('myname'), 'get meta');
      document.body.removeChild(meta);
    });

    it('finds element by id in body, not element by name in head', () => {
      const DOM = DOMUtils(document, { keep_values: true, schema: Schema() });

      const meta = document.createElement('meta');
      meta.setAttribute('name', 'myname');
      document.head.appendChild(meta);

      const div = document.createElement('div');
      div.setAttribute('id', 'myname');
      document.body.appendChild(div);

      assert.strictEqual(DOM.get('myname'), div, 'get div');
      document.head.removeChild(meta);
      document.body.removeChild(div);
    });

    it('returns element', () => {
      const DOM = DOMUtils(document, { keep_values: true, schema: Schema() });
      const e = document.createElement('div');
      assert.strictEqual(DOM.get(e), e, 'get');
    });
  });

  context('isChildOf', () => {
    it('same node', () => {
      const p = document.createElement('div');
      assert.isTrue(DOM.isChildOf(p, p), 'Same node');
    });

    it('child nodes', () => {
      const p = document.createElement('div');
      const m = document.createElement('p');
      const s = document.createTextNode('Content');
      m.appendChild(s);
      assert.isFalse(DOM.isChildOf(s, p), 'Detached text node');
      assert.isFalse(DOM.isChildOf(m, p), 'Detached para node');
      p.appendChild(m);
      assert.isTrue(DOM.isChildOf(s, p), 'Attached text node');
      assert.isTrue(DOM.isChildOf(m, p), 'Attached para node');
    });
  });

  context('isEditable', () => {
    const withScratchDomUtils = (innerHtml: string, f: (dom: DOMUtils, root: SugarElement<HTMLElement>) => void) => {
      const root = SugarElement.fromHtml<HTMLElement>(`<div>${innerHtml}</div>`);

      Insert.append(SugarBody.body(), root);

      const dom = DOMUtils(document, { root_element: root.dom, schema: Schema() });

      f(dom, root);

      dom.destroy();
      Remove.remove(root);
    };

    const testIsEditable = (testCase: { input: string; editableRoot?: boolean; path: number[]; expected: boolean }) => () => {
      withScratchDomUtils(testCase.input, (domUtils, root) => {
        const scope = Hierarchy.follow(root, testCase.path).getOrDie('Could not find element by path');
        ContentEditable.set(root, testCase.editableRoot ?? true);
        assert.equal(domUtils.isEditable(scope.dom), testCase.expected, 'Should be the expected editable state');
      });
    };

    it('TINY-9462: isEditable on text node in editable root', testIsEditable({
      input: 'text node',
      path: [],
      expected: true
    }));

    it('TINY-9462: isEditable on text node in noneditable root', testIsEditable({
      input: 'text node',
      editableRoot: false,
      path: [],
      expected: false
    }));

    it('TINY-9462: isEditable on element in editable root', testIsEditable({
      input: '<p>test</p>',
      path: [ 0 ],
      expected: true
    }));

    it('TINY-9462: isEditable on element in noneditable root', testIsEditable({
      input: '<p>test</p>',
      editableRoot: false,
      path: [ 0 ],
      expected: false
    }));

    it('TINY-9462: isEditable on text node in element in editable root', testIsEditable({
      input: '<p>test</p>',
      path: [ 0, 0 ],
      expected: true
    }));

    it('TINY-9462: isEditable on text node in element in noneditable root', testIsEditable({
      input: '<p>test</p>',
      editableRoot: false,
      path: [ 0, 0 ],
      expected: false
    }));

    it('TINY-9462: isEditable on text node in noneditable element in editable root', testIsEditable({
      input: '<p contenteditable="false">test</p>',
      path: [ 0, 0 ],
      expected: false
    }));

    it('TINY-9462: isEditable on text node in editable element in noneditable root', testIsEditable({
      input: '<p contenteditable="true">test</p>',
      editableRoot: false,
      path: [ 0, 0 ],
      expected: true
    }));

    it('TINY-9462: isEditable on element in noneditable element in editable root', testIsEditable({
      input: '<p contenteditable="false"><span></span></p>',
      path: [ 0, 0 ],
      expected: false
    }));

    it('TINY-9462: isEditable on element in editable element in noneditable root', testIsEditable({
      input: '<p contenteditable="true"><span></span></p>',
      editableRoot: false,
      path: [ 0, 0 ],
      expected: true
    }));

    it('TINY-10237: isEditable on SVG element should always be considered non-editable', testIsEditable({
      input: '<svg></svg>',
      path: [ 0 ],
      expected: false
    }));
  });
});

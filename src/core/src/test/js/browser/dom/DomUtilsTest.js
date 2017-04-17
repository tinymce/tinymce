asynctest(
  'browser.tinymce.core.dom.DomUtilsTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'global!document',
    'global!window',
    'tinymce.core.dom.Dimensions',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.Env',
    'tinymce.core.html.Schema',
    'tinymce.core.test.HtmlUtils',
    'tinymce.core.test.ViewBlock',
    'tinymce.core.util.Arr',
    'tinymce.core.util.Tools'
  ],
  function (Pipeline, LegacyUnit, document, window, Dimensions, DOMUtils, Env, Schema, HtmlUtils, ViewBlock, Arr, Tools) {
    var DOM = new DOMUtils(document, { keep_values : true, schema : new Schema() });
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    suite.test('parseStyle', function () {
      var dom;

      DOM.add(document.body, 'div', { id : 'test' });

      dom = new DOMUtils(document, { hex_colors : true, keep_values : true, url_converter : function (u) {
        return 'X' + u + 'Y';
      } });

      LegacyUnit.equal(
        dom.serializeStyle(dom.parseStyle('border: 1px solid red; color: green')),
        'border: 1px solid red; color: green;'
      );

      LegacyUnit.equal(
        dom.serializeStyle(dom.parseStyle('border: 1px solid rgb(0, 255, 255); color: green')),
        'border: 1px solid #00ffff; color: green;'
      );

      LegacyUnit.equal(
        dom.serializeStyle(
          dom.parseStyle('border-top: 1px solid red; border-left: 1px solid red; border-bottom: 1px solid red; border-right: 1px solid red;')
        ),
        'border: 1px solid red;'
      );

      LegacyUnit.equal(
        dom.serializeStyle(
          dom.parseStyle('border-width: 1pt 1pt 1pt 1pt; border-style: none none none none; border-color: black black black black;')
        ),
        'border: 1pt none black;'
      );

      LegacyUnit.equal(
        dom.serializeStyle(
          dom.parseStyle('border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;')
        ),
        'border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;'
      );

      LegacyUnit.equal(
        dom.serializeStyle(dom.parseStyle('background: transparent url(test.gif);')),
        'background: transparent url(\'Xtest.gifY\');'
      );

      LegacyUnit.equal(
        dom.serializeStyle(dom.parseStyle('background: transparent url(http://www.site.com/test.gif?a=1&b=2);')),
        'background: transparent url(\'Xhttp://www.site.com/test.gif?a=1&b=2Y\');'
      );

      dom.setHTML('test', '<span id="test2" style="   margin-left: 1px;    margin-top: 1px;   margin-right: 1px;   margin-bottom: 1px   "></span>');
      LegacyUnit.equal(dom.getAttrib('test2', 'style'), 'margin: 1px;');

      dom.setHTML('test', '<span id="test2" style="background-image: url(test.gif);"></span>');
      LegacyUnit.equal(dom.getAttrib('test2', 'style'), 'background-image: url(\'Xtest.gifY\');');

      // dom.get('test').innerHTML = '<span id="test2" style="border: 1px solid #00ff00"></span>';
      // LegacyUnit.equal(dom.getAttrib('test2', 'style'), Env.ue && !window.getSelection ?
      // 'border: #00ff00 1px solid;' : 'border: 1px solid #00ff00;'); // IE has a separate output

      dom.get('test').innerHTML = '<span id="test2" style="background-image: url(http://www.site.com/test.gif);"></span>';
      LegacyUnit.equal(dom.getAttrib('test2', 'style'), 'background-image: url(\'Xhttp://www.site.com/test.gifY\');');

      DOM.remove('test');
    });

    suite.test('addClass', function () {
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.get('test').className = '';
      DOM.addClass('test', 'abc');
      LegacyUnit.equal(DOM.get('test').className, 'abc');

      DOM.addClass('test', '123');
      LegacyUnit.equal(DOM.get('test').className, 'abc 123');

      DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
      DOM.addClass(DOM.select('span', 'test'), 'abc');
      LegacyUnit.equal(DOM.get('test2').className, 'abc');
      LegacyUnit.equal(DOM.get('test3').className, 'abc');
      LegacyUnit.equal(DOM.get('test4').className, 'abc');
      DOM.get('test').innerHTML = '';

      DOM.remove('test');
    });

    suite.test('removeClass', function () {
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.get('test').className = 'abc 123 xyz';
      DOM.removeClass('test', '123');
      LegacyUnit.equal(DOM.get('test').className, 'abc xyz');

      DOM.get('test').innerHTML = (
        '<span id="test2" class="test1"></span><span id="test3" class="test test1 test"></span><span id="test4" class="test1 test"></span>'
      );
      DOM.removeClass(DOM.select('span', 'test'), 'test1');
      LegacyUnit.equal(DOM.get('test2').className, '');
      LegacyUnit.equal(DOM.get('test3').className, 'test test');
      LegacyUnit.equal(DOM.get('test4').className, 'test');

      DOM.get('test').innerHTML = '<span id="test2" class="test"></span>';
      DOM.removeClass('test2', 'test');
      LegacyUnit.equal(HtmlUtils.normalizeHtml(DOM.get('test').innerHTML), '<span id="test2"></span>');

      DOM.remove('test');
    });

    suite.test('hasClass', function () {
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.get('test').className = 'abc 123 xyz';
      LegacyUnit.equal(DOM.hasClass('test', 'abc'), true);
      LegacyUnit.equal(DOM.hasClass('test', '123'), true);
      LegacyUnit.equal(DOM.hasClass('test', 'xyz'), true);
      LegacyUnit.equal(DOM.hasClass('test', 'aaa'), false);

      DOM.get('test').className = 'abc';
      LegacyUnit.equal(DOM.hasClass('test', 'abc'), true);

      DOM.get('test').className = 'aaa abc';
      LegacyUnit.equal(DOM.hasClass('test', 'abc'), true);

      DOM.get('test').className = 'abc aaa';
      LegacyUnit.equal(DOM.hasClass('test', 'abc'), true);

      DOM.remove('test');
    });

    suite.test('add', function () {
      var e;

      DOM.add(document.body, 'div', { id : 'test' });

      DOM.add('test', 'span', { 'class' : 'abc 123' }, 'content <b>abc</b>');
      e = DOM.get('test').getElementsByTagName('span')[0];
      LegacyUnit.equal(e.className, 'abc 123');
      LegacyUnit.equal(e.innerHTML.toLowerCase(), 'content <b>abc</b>');
      DOM.remove(e);

      DOM.add('test', 'span', { 'class' : 'abc 123' });
      e = DOM.get('test').getElementsByTagName('span')[0];
      LegacyUnit.equal(e.className, 'abc 123');
      DOM.remove(e);

      DOM.add('test', 'span');
      e = DOM.get('test').getElementsByTagName('span')[0];
      LegacyUnit.equal(e.nodeName, 'SPAN');
      DOM.remove(e);

      DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
      DOM.add(['test2', 'test3', 'test4'], 'span', { 'class' : 'abc 123' });
      LegacyUnit.equal(DOM.select('span', 'test').length, 6);

      DOM.remove('test');
    });

    suite.test('create', function () {
      var e;

      e = DOM.create('span', { 'class' : 'abc 123' }, 'content <b>abc</b>');

      LegacyUnit.equal(e.nodeName, 'SPAN');
      LegacyUnit.equal(e.className, 'abc 123');
      LegacyUnit.equal(e.innerHTML.toLowerCase(), 'content <b>abc</b>');
    });

    suite.test('createHTML', function () {
      LegacyUnit.equal(
        DOM.createHTML('span', { 'id': 'id1', 'class': 'abc 123' }, 'content <b>abc</b>'),
        '<span id="id1" class="abc 123">content <b>abc</b></span>'
      );
      LegacyUnit.equal(DOM.createHTML('span', { 'id': 'id1', 'class': 'abc 123' }), '<span id="id1" class="abc 123" />');
      LegacyUnit.equal(DOM.createHTML('span', { 'id': null, 'class': undefined }), '<span />');
      LegacyUnit.equal(DOM.createHTML('span'), '<span />');
      LegacyUnit.equal(DOM.createHTML('span', null, 'content <b>abc</b>'), '<span>content <b>abc</b></span>');
    });

    suite.test('uniqueId', function () {
      DOM.counter = 0;

      LegacyUnit.equal(DOM.uniqueId(), 'mce_0');
      LegacyUnit.equal(DOM.uniqueId(), 'mce_1');
      LegacyUnit.equal(DOM.uniqueId(), 'mce_2');
    });

    suite.test('showHide', function () {
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.show('test');
      LegacyUnit.equal(DOM.get('test').style.display, '');
      LegacyUnit.equal(DOM.isHidden('test'), false);

      DOM.hide('test');
      LegacyUnit.equal(DOM.get('test').style.display, 'none');
      LegacyUnit.equal(DOM.isHidden('test'), true);

      // Cleanup
      DOM.setAttrib('test', 'style', '');

      DOM.remove('test');
    });

    suite.test('select', function () {
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.setHTML('test', '<div>test 1</div><div>test 2 <div>test 3</div></div><div>test 4</div>');
      LegacyUnit.equal(DOM.select('div', 'test').length, 4);
      LegacyUnit.equal(DOM.select('div', 'test').reverse !== undefined, true);

      DOM.setHTML('test', '<div class="test1 test2 test3">test 1</div><div class="test2">test 2 <div>test 3</div></div><div>test 4</div>');
      LegacyUnit.equal(DOM.select('div.test2', 'test').length, 2);

      DOM.setHTML('test', '<div class="test1 test2 test3">test 1</div><div class="test2">test 2 <div>test 3</div></div><div>test 4</div>');
      LegacyUnit.equal(DOM.select('div div', 'test').length, 1, null, Env.webkit); // Issue: http://bugs.webkit.org/show_bug.cgi?id=17461
      //alert(DOM.select('div div', 'test').length +","+DOM.get('test').querySelectorAll('div div').length);

      DOM.remove('test');
    });

    suite.test('is', function () {
      DOM.add(document.body, 'div', { id : 'test' });
      DOM.setHTML('test', '<div id="textX" class="test">test 1</div>');

      LegacyUnit.equal(DOM.is(DOM.get('textX'), 'div'), true);
      LegacyUnit.equal(DOM.is(DOM.get('textX'), 'div#textX.test'), true);
      LegacyUnit.equal(DOM.is(DOM.get('textX'), 'div#textX2'), false);
      LegacyUnit.equal(DOM.is(null, 'div#textX2'), false);

      DOM.remove('test');
    });

    suite.test('encode', function () {
      LegacyUnit.equal(DOM.encode('abc<>"&\'\u00e5\u00e4\u00f6'), 'abc&lt;&gt;&quot;&amp;&#39;\u00e5\u00e4\u00f6');
    });

    suite.test('setGetAttrib', function () {
      var dom;

      DOM.add(document.body, 'div', { id : 'test' });

      DOM.setAttrib('test', 'class', 'test 123');
      LegacyUnit.equal(DOM.getAttrib('test', 'class'), 'test 123');

      DOM.setAttrib('test', 'src', 'url');
      LegacyUnit.equal(DOM.getAttrib('test', 'src'), 'url');
      LegacyUnit.equal(DOM.getAttrib('test', 'data-mce-src'), 'url');
      LegacyUnit.equal(DOM.getAttrib('test', 'abc'), '');

      DOM.setAttribs('test', { 'class' : '123', title : 'abc' });
      LegacyUnit.equal(DOM.getAttrib('test', 'class'), '123');
      LegacyUnit.equal(DOM.getAttrib('test', 'title'), 'abc');

      DOM.setAttribs('test');
      LegacyUnit.equal(DOM.getAttrib('test', 'class'), '123');
      LegacyUnit.equal(DOM.getAttrib('test', 'title'), 'abc');

      dom = new DOMUtils(document, { keep_values : true, url_converter : function (u, n) {
        return '&<>"' + u + '&<>"' + n;
      } });

      dom.setAttribs('test', { src : '123', href : 'abc' });
      LegacyUnit.equal(DOM.getAttrib('test', 'src'), '&<>"123&<>"src');
      LegacyUnit.equal(DOM.getAttrib('test', 'href'), '&<>"abc&<>"href');

      LegacyUnit.equal(DOM.getAttrib(document, 'test'), '');
      LegacyUnit.equal(DOM.getAttrib(document, 'test', ''), '');
      LegacyUnit.equal(DOM.getAttrib(document, 'test', 'x'), 'x');

      DOM.remove('test');
    });

    suite.test('setGetAttrib on null', function () {
      LegacyUnit.equal(DOM.getAttrib(null, 'test'), '');
      DOM.setAttrib(null, 'test');
    });

    suite.test('getAttribs', function () {
      var check = function (obj, val) {
        var count = 0;

        val = val.split(',');

        Tools.each(obj, function (o) {
          if (Tools.inArray(val, o.nodeName.toLowerCase()) !== -1 && o.specified) {
            count++;
          }
        });

        return count === obj.length;
      };

      DOM.add(document.body, 'div', { id : 'test' });

      DOM.get('test').innerHTML = '<span id="test2" class="test"></span>';
      LegacyUnit.equal(check(DOM.getAttribs('test2'), 'id,class'), true);

      DOM.get('test').innerHTML = '<input id="test2" type="checkbox" name="test" value="1" disabled readonly checked></span>';
      LegacyUnit.equal(
        check(DOM.getAttribs('test2'), 'id,type,name,value,disabled,readonly,checked'),
        true,
        'Expected attributed: type,name,disabled,readonly,checked'
      );

      DOM.remove('test');
    });

    suite.test('setGetStyles', function () {
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.setStyle('test', 'font-size', '20px');
      LegacyUnit.equal(DOM.getStyle('test', 'font-size'), '20px');

      DOM.setStyle('test', 'fontSize', '21px');
      LegacyUnit.equal(DOM.getStyle('test', 'fontSize'), '21px');

      DOM.setStyles('test', { fontSize : '22px', display : 'inline' });
      LegacyUnit.equal(DOM.getStyle('test', 'fontSize'), '22px');
      LegacyUnit.equal(DOM.getStyle('test', 'display'), 'inline');

      DOM.setStyle('test', 'fontSize', 23);
      LegacyUnit.equal(DOM.getStyle('test', 'fontSize'), '23px');

      DOM.setStyle('test', 'fontSize', 23);
      DOM.setStyle('test', 'fontSize', '');
      LegacyUnit.equal(DOM.getStyle('test', 'fontSize'), '');

      DOM.setStyle('test', 'fontSize', 23);
      DOM.setStyle('test', 'fontSize', null);
      LegacyUnit.equal(DOM.getStyle('test', 'fontSize'), '');

      DOM.setAttrib('test', 'style', '');
      LegacyUnit.equal(typeof DOM.getStyle(null, 'fontSize'), 'undefined');

      DOM.remove('test');
    });

    suite.test('getPos', function () {
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.setStyles('test', { position : 'absolute', left : 100, top : 110 });
      LegacyUnit.equal(DOM.getPos('test').x, 100);
      LegacyUnit.equal(DOM.getPos('test').y, 110);

      DOM.setAttrib('test', 'style', '');

      DOM.remove('test');
    });

    var eqNodeName = function (name) {
      return function (n) {
        return n.nodeName === name;
      };
    };

    suite.test('getParent', function () {
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.get('test').innerHTML = '<div><span>ab<a id="test2" href="">abc</a>c</span></div>';

      LegacyUnit.equal(DOM.getParent('test2', eqNodeName('SPAN')).nodeName, 'SPAN');
      LegacyUnit.equal(DOM.getParent('test2', eqNodeName('BODY')).nodeName, 'BODY');
      LegacyUnit.equal(DOM.getParent('test2', eqNodeName('BODY'), document.body), null);
      LegacyUnit.equal(DOM.getParent('test2', eqNodeName('X')), null);
      LegacyUnit.equal(DOM.getParent('test2', 'SPAN').nodeName, 'SPAN');
      LegacyUnit.equal(DOM.getParent('test2', 'body', DOM.get('test')), null);

      DOM.get('test').innerHTML = '';

      DOM.remove('test');
    });

    suite.test('getParents', function () {
      DOM.add(document.body, 'div', { id : 'test' });
      DOM.get('test').innerHTML = '<div><span class="test">ab<span><a id="test2" href="">abc</a>c</span></span></div>';

      LegacyUnit.equal(DOM.getParents('test2', eqNodeName('SPAN')).length, 2);
      LegacyUnit.equal(DOM.getParents('test2', 'span').length, 2);
      LegacyUnit.equal(DOM.getParents('test2', 'span.test').length, 1);
      LegacyUnit.equal(DOM.getParents('test2', 'body', DOM.get('test')).length, 0);

      DOM.remove('test');
    });

    suite.test('is', function () {
      DOM.add(document.body, 'div', { id : 'test' });
      DOM.get('test').innerHTML = '<div><span class="test">ab<span><a id="test2" href="">abc</a>c</span></span></div>';

      LegacyUnit.equal(DOM.is(DOM.select('span', 'test'), 'span'), true);
      LegacyUnit.equal(DOM.is(DOM.select('#test2', 'test'), '#test2'), true);

      DOM.remove('test');
    });

    suite.test('getViewPort', function () {
      var wp;

      wp = DOM.getViewPort();
      LegacyUnit.equal(wp.x, 0);
      LegacyUnit.equal(wp.y, 0);
      LegacyUnit.equal(wp.w > 0, true);
      LegacyUnit.equal(wp.h > 0, true);
    });

    suite.test('getRect', function () {
      var r;

      DOM.add(document.body, 'div', { id : 'test' });

      DOM.setStyles('test', { position : 'absolute', left : 100, top : 110, width : 320, height : 240 });
      r = DOM.getRect('test');
      LegacyUnit.equal(r.x, 100);
      LegacyUnit.equal(r.y, 110);
      LegacyUnit.equal(r.w, 320);
      LegacyUnit.equal(r.h, 240);

      DOM.setAttrib('test', 'style', '');

      DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:50%;height:240px"></div></div>';
      r = DOM.getRect('test2');
      LegacyUnit.equal(r.w, 160);

      DOM.remove('test');
    });

    suite.test('getSize', function () {
      var r;

      DOM.add(document.body, 'div', { id : 'test' });

      DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:50%;height:240px"></div></div>';
      r = DOM.getSize('test2');
      LegacyUnit.equal(r.w, 160);

      DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:100px;height:240px"></div></div>';
      r = DOM.getSize('test2');
      LegacyUnit.equal(r.w, 100);

      DOM.remove('test');
    });

    suite.test('getNext', function () {
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.get('test').innerHTML = '<strong>A</strong><span>B</span><em>C</em>';
      LegacyUnit.equal(DOM.getNext(DOM.get('test').firstChild, '*').nodeName, 'SPAN');
      LegacyUnit.equal(DOM.getNext(DOM.get('test').firstChild, 'em').nodeName, 'EM');
      LegacyUnit.equal(DOM.getNext(DOM.get('test').firstChild, 'div'), null);
      LegacyUnit.equal(DOM.getNext(null, 'div'), null);
      LegacyUnit.equal(DOM.getNext(DOM.get('test').firstChild, eqNodeName('EM')).nodeName, 'EM');

      DOM.remove('test');
    });

    suite.test('getPrev', function () {
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.get('test').innerHTML = '<strong>A</strong><span>B</span><em>C</em>';
      LegacyUnit.equal(DOM.getPrev(DOM.get('test').lastChild, '*').nodeName, 'SPAN');
      LegacyUnit.equal(DOM.getPrev(DOM.get('test').lastChild, 'strong').nodeName, 'STRONG');
      LegacyUnit.equal(DOM.getPrev(DOM.get('test').lastChild, 'div'), null);
      LegacyUnit.equal(DOM.getPrev(null, 'div'), null);
      LegacyUnit.equal(DOM.getPrev(DOM.get('test').lastChild, eqNodeName('STRONG')).nodeName, 'STRONG');

      DOM.remove('test');
    });

    suite.test('loadCSS', function () {
      var c = 0;

      DOM.loadCSS('tinymce/dom/test.css?a=1,tinymce/dom/test.css?a=2,tinymce/dom/test.css?a=3');

      Tools.each(document.getElementsByTagName('link'), function (n) {
        if (n.href.indexOf('test.css?a=') !== -1) {
          c++;
        }
      });

      LegacyUnit.equal(c, 3);
    });

    suite.test('insertAfter', function () {
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.setHTML('test', '<span id="test2"></span>');
      DOM.insertAfter(DOM.create('br'), 'test2');
      LegacyUnit.equal(DOM.get('test2').nextSibling.nodeName, 'BR');

      DOM.setHTML('test', '<span>test</span><span id="test2"></span><span>test</span>');
      DOM.insertAfter(DOM.create('br'), 'test2');
      LegacyUnit.equal(DOM.get('test2').nextSibling.nodeName, 'BR');

      DOM.remove('test');
    });

    suite.test('isBlock', function () {
      LegacyUnit.equal(DOM.isBlock(DOM.create('div')), true);
      LegacyUnit.equal(DOM.isBlock('DIV'), true);
      LegacyUnit.equal(DOM.isBlock('SPAN'), false);
      LegacyUnit.equal(DOM.isBlock('div'), true);
    });

    suite.test('remove', function () {
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
      DOM.remove('test2', 1);
      LegacyUnit.equal(DOM.get('test').innerHTML.toLowerCase(), '<span>test</span><span>test2</span>');

      DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
      LegacyUnit.equal(DOM.remove('test2').nodeName, 'SPAN');

      DOM.remove('test');
    });

    suite.test('replace', function () {
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
      DOM.replace(DOM.create('div', { id : 'test2' }), 'test2', 1);
      LegacyUnit.equal(DOM.get('test2').innerHTML.toLowerCase(), '<span>test</span><span>test2</span>');

      DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
      DOM.replace(DOM.create('div', { id : 'test2' }), 'test2');
      LegacyUnit.equal(DOM.get('test2').innerHTML, '');

      DOM.remove('test');
    });

    suite.test('toHex', function () {
      LegacyUnit.equal(DOM.toHex('rgb(0, 255, 255)'), '#00ffff');
      LegacyUnit.equal(DOM.toHex('rgb(255, 0, 0)'), '#ff0000');
      LegacyUnit.equal(DOM.toHex('rgb(0, 0, 255)'), '#0000ff');
      LegacyUnit.equal(DOM.toHex('rgb  (  0  , 0  , 255  )  '), '#0000ff');
      LegacyUnit.equal(DOM.toHex('   RGB  (  0  , 0  , 255  )  '), '#0000ff');
    });

    suite.test('getOuterHTML', function () {
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
      LegacyUnit.equal(DOM.getOuterHTML('test2').toLowerCase().replace(/\"/g, ''), '<span id=test2><span>test</span><span>test2</span></span>');

      DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
      DOM.setOuterHTML('test2', '<div id="test2">123</div>');
      LegacyUnit.equal(Tools.trim(DOM.getOuterHTML('test2') || '').toLowerCase().replace(/\"/g, ''), '<div id=test2>123</div>');

      DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
      DOM.setOuterHTML('test2', '<div id="test2">123</div><div id="test3">abc</div>');
      LegacyUnit.equal(
        Tools.trim(DOM.get('test').innerHTML).toLowerCase().replace(/>\s+</g, '><').replace(/\"/g, ''),
        '<div id=test2>123</div><div id=test3>abc</div>'
      );

      DOM.setHTML('test', 'test');
      LegacyUnit.equal(Tools.trim(DOM.getOuterHTML(DOM.get('test').firstChild)), 'test');

      DOM.remove('test');
    });

    suite.test('encodeDecode', function () {
      LegacyUnit.equal(DOM.encode('\u00e5\u00e4\u00f6&<>"'), '\u00e5\u00e4\u00f6&amp;&lt;&gt;&quot;');
      LegacyUnit.equal(DOM.decode('&aring;&auml;&ouml;&amp;&lt;&gt;&quot;'), '\u00e5\u00e4\u00f6&<>"');
    });

    suite.test('split', function () {
      var point, parent;
      DOM.add(document.body, 'div', { id : 'test' });

      DOM.setHTML('test', '<p><b>text1<span>inner</span>text2</b></p>');
      parent = DOM.select('p', DOM.get('test'))[0];
      point = DOM.select('span', DOM.get('test'))[0];
      DOM.split(parent, point);
      LegacyUnit.equal(DOM.get('test').innerHTML.toLowerCase().replace(/\s+/g, ''), '<p><b>text1</b></p><span>inner</span><p><b>text2</b></p>');

      DOM.setHTML('test', '<ul><li>first line<br><ul><li><span>second</span> <span>line</span></li><li>third line<br></li></ul></li></ul>');
      parent = DOM.select('li:nth-child(1)', DOM.get('test'))[0];
      point = DOM.select('ul li:nth-child(2)', DOM.get('test'))[0];
      DOM.split(parent, point);
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(DOM.get('test').innerHTML),
        '<ul><li>first line<br><ul><li><span>second</span> <span>line</span></li></ul></li><li>third line<br></li></ul>'
      );

      DOM.remove('test');
    });

    suite.test('nodeIndex', function () {
      DOM.add(document.body, 'div', { id : 'test' }, 'abc<b>abc</b>abc');

      LegacyUnit.equal(DOM.nodeIndex(DOM.get('test').childNodes[0]), 0, 'Index of first child.');
      LegacyUnit.equal(DOM.nodeIndex(DOM.get('test').childNodes[1]), 1, 'Index of second child.');
      LegacyUnit.equal(DOM.nodeIndex(DOM.get('test').childNodes[2]), 2, 'Index of third child.');

      DOM.get('test').insertBefore(DOM.doc.createTextNode('a'), DOM.get('test').firstChild);
      DOM.get('test').insertBefore(DOM.doc.createTextNode('b'), DOM.get('test').firstChild);

      LegacyUnit.equal(DOM.nodeIndex(DOM.get('test').lastChild), 4, 'Index of last child with fragmented DOM.');
      LegacyUnit.equal(DOM.nodeIndex(DOM.get('test').lastChild, true), 2, 'Normalized index of last child with fragmented DOM.');

      DOM.remove('test');
    });

    suite.test('isEmpty without defined schema', function () {
      DOM.add(document.body, 'div', { id : 'test' }, '');

      var domUtils = new DOMUtils(document);

      DOM.setHTML('test', '<hr>');
      LegacyUnit.equal(domUtils.isEmpty(DOM.get('test')), false, 'Should be false since hr is something');

      DOM.setHTML('test', '<p><br></p>');
      LegacyUnit.equal(domUtils.isEmpty(DOM.get('test')), true, 'Should be true since the paragraph is empty');

      DOM.remove('test');
    });

    suite.test('isEmpty', function () {
      DOM.schema = new Schema(); // A schema will be added when used within a editor instance
      DOM.add(document.body, 'div', { id : 'test' }, '');

      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), true, 'No children');

      DOM.setHTML('test', '<br />');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), true, 'Br child');

      DOM.setHTML('test', '<br /><br />');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), false, 'Br children');

      DOM.setHTML('test', 'text');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), false, 'Text child');

      DOM.setHTML('test', '<span>text</span>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), false, 'Text child in span');

      DOM.setHTML('test', '<span></span>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), true, 'Empty span child');

      DOM.setHTML('test', '<div><span><b></b></span><b></b><em></em></div>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), true, 'Empty complex HTML');

      DOM.setHTML('test', '<div><span><b></b></span><b></b><em>X</em></div>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), false, 'Non empty complex HTML');

      DOM.setHTML('test', '<div><span><b></b></span><b></b><em> </em></div>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), true, 'Non empty complex HTML with space');

      DOM.setHTML('test', '<div><span><b></b></span><b></b><em><a name="x"></a></em></div>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), false, 'Non empty complex HTML with achor name');

      DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif">');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), false, 'Non empty html with img element');

      DOM.setHTML('test', '<span data-mce-bookmark="1"></span>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), false, 'Span with bookmark attribute.');

      DOM.setHTML('test', '<span data-mce-style="color:Red"></span>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), true, 'Span with data-mce attribute.');

      DOM.setHTML('test', '<div><!-- comment --></div>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), false, 'Element with comment.');

      DOM.setHTML('test', '<span data-mce-bogus="1"></span>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), true, 'Contains just a bogus element.');

      DOM.setHTML('test', '<span data-mce-bogus="1">a</span>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), false, 'Contains a text node in a bogus element.');

      DOM.setHTML('test', '<span data-mce-bogus="all">a</span>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), true, 'Contains just a bogus all element.');

      DOM.setHTML('test', '<span data-mce-bogus="all">a</span>b');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), false, 'Contains a bogus all element but some text as well.');

      DOM.setHTML('test', '<code> </code>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), false, 'Contains a code element should be treated as content.');

      DOM.setHTML('test', '<pre> </pre>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), false, 'Contains a pre element should be treated as content.');

      DOM.setHTML('test', '<code></code>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), false, 'Contains a code element should be treated as content.');

      DOM.setHTML('test', '<pre></pre>');
      LegacyUnit.equal(DOM.isEmpty(DOM.get('test')), false, 'Contains a pre element should be treated as content.');

      DOM.remove('test');
    });

    suite.test('isEmpty with list of elements considered non-empty', function () {
      var elm = DOM.create('p', null, '<img>');
      LegacyUnit.equal(false, DOM.isEmpty(elm, { img: true }));
    });

    suite.test('isEmpty on pre', function () {
      var elm = DOM.create('pre', null, '  ');
      LegacyUnit.equal(false, DOM.isEmpty(elm));
    });

    suite.test('isEmpty with list of elements considered non-empty without schema', function () {
      var domWithoutSchema = new DOMUtils(document, { keep_values: true });

      var elm = domWithoutSchema.create('p', null, '<img>');
      LegacyUnit.equal(false, domWithoutSchema.isEmpty(elm, { img: true }));
    });

    suite.test('isEmpty on P with BR in EM', function () {
      var elm = DOM.create('p', null, '<em><br></em>');
      LegacyUnit.equal(DOM.isEmpty(elm), true, 'No children');
    });

    suite.test('isEmpty on P with two BR in EM', function () {
      var elm = DOM.create('p', null, '<em><br><br></em>');
      LegacyUnit.equal(false, DOM.isEmpty(elm));
    });

    suite.test('bind/unbind/fire', function () {
      var count = 0;

      DOM.bind(document, 'click', function () {
        count++;
      });
      DOM.fire(document, 'click');
      DOM.unbind(document, 'click');
      LegacyUnit.equal(count, 1);

      count = 0;
      DOM.bind([document, window], 'click', function (e) {
        e.stopPropagation();
        count++;
      });
      DOM.fire(document, 'click');
      DOM.fire(window, 'click');
      DOM.unbind([document, window], 'click');
      LegacyUnit.equal(count, 2);

      count = 0;
      DOM.fire(document, 'click');
      DOM.fire(window, 'click');
      LegacyUnit.equal(count, 0);
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      DOM.remove('test');
      success();
    }, failure);
  }
);

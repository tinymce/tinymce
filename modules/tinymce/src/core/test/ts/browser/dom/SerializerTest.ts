import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import DomSerializer from 'tinymce/core/api/dom/Serializer';
import * as TrimBody from 'tinymce/core/dom/TrimBody';
import * as Zwsp from 'tinymce/core/text/Zwsp';

import * as ViewBlock from '../../module/test/ViewBlock';

declare const escape: any;

describe('browser.tinymce.core.dom.SerializerTest', () => {
  const DOM = DOMUtils.DOM;
  const viewBlock = ViewBlock.bddSetup();
  viewBlock.get().id = 'test';

  const setTestHtml = (html: string) =>
    DOM.setHTML('test', html);

  const getTestElement = () =>
    DOM.get('test') as HTMLElement;

  const trim = (ser: DomSerializer, html: string) => {
    const container = DOM.create('div', {}, html);
    const trimmed = TrimBody.trim(container, ser.getTempAttrs());
    return Zwsp.trim(trimmed.innerHTML);
  };

  afterEach(() => {
    viewBlock.update('');
  });

  it('Schema rules', () => {
    let ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('@[id|title|class|style],div,img[src|alt|-style|border],span,hr');
    setTestHtml('<img title="test" src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" alt="test" ' +
      'border="0" style="border: 1px solid red" class="test" /><span id="test2">test</span><hr />');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<img title="test" class="test" src="tinymce/ui/img/raster.gif" ' +
      'alt="test" border="0"><span id="test2">test</span><hr>', 'Global rule'
    );

    ser.setRules('*a[*],em/i[*],strong/b[*i*]');
    setTestHtml('<a href="test" data-mce-href="test">test</a><strong title="test" class="test">test2</strong><em title="test">test3</em>');
    assert.equal(ser.serialize(getTestElement()), '<a href="test">test</a><strong title="test">test2</strong><em title="test">' +
      'test3</em>', 'Wildcard rules');

    ser.setRules('br,hr,input[type|name|value],div[id],span[id],strong/b,a,em/i,a[!href|!name],img[src|border=0|title={$uid}]');
    setTestHtml('<br /><hr /><input type="text" name="test" value="val" class="no" />' +
      '<span id="test2" class="no"><b class="no">abc</b><em class="no">123</em></span>123<a href="file.html" ' +
      'data-mce-href="file.html">link</a><a name="anchor"></a><a>no</a><img src="tinymce/ui/img/raster.gif" ' +
      'data-mce-src="tinymce/ui/img/raster.gif" />');
    assert.equal(ser.serialize(getTestElement()), '<div id="test"><br><hr><input type="text" name="test" value="val">' +
      '<span id="test2"><strong>abc</strong><em>123</em></span>123<a href="file.html">link</a>' +
      '<a name="anchor"></a>no<img src="tinymce/ui/img/raster.gif" border="0" title="mce_0"></div>', 'Output name and attribute rules');

    ser.setRules('img[src|border=0|alt=]');
    setTestHtml('<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" border="0" alt="" />');
    assert.equal(ser.serialize(getTestElement()), '<img src="tinymce/ui/img/raster.gif" border="0" alt="">', 'Default attribute with empty value');

    ser.setRules('img[src|border=0|alt=],div[style|id],*[*]');
    setTestHtml('<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" /><hr />');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<img src="tinymce/ui/img/raster.gif" border="0" alt=""><hr>'
    );

    ser = DomSerializer({
      valid_elements: 'img[src|border=0|alt=]',
      extended_valid_elements: 'div[id],img[src|alt=]'
    });
    setTestHtml('<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" alt="" />');
    assert.equal(
      ser.serialize(getTestElement()),
      '<div id="test"><img src="tinymce/ui/img/raster.gif" alt=""></div>'
    );

    ser = DomSerializer({ invalid_elements: 'hr,br' });
    setTestHtml('<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" /><hr /><br />');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<img src="tinymce/ui/img/raster.gif">'
    );
  });

  it('allow_unsafe_link_target (default)', () => {
    const ser = DomSerializer({ });

    setTestHtml('<a href="a" target="_blank">a</a><a href="b" target="_blank">b</a>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<a href="a" target="_blank" rel="noopener">a</a><a href="b" target="_blank" rel="noopener">b</a>'
    );

    setTestHtml('<a href="a" rel="lightbox" target="_blank">a</a><a href="b" rel="lightbox" target="_blank">b</a>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<a href="a" target="_blank" rel="lightbox noopener">a</a><a href="b" target="_blank" rel="lightbox noopener">b</a>'
    );

    setTestHtml('<a href="a" rel="lightbox x" target="_blank">a</a><a href="b" rel="lightbox x" target="_blank">b</a>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<a href="a" target="_blank" rel="lightbox noopener x">a</a><a href="b" target="_blank" rel="lightbox noopener x">b</a>'
    );

    setTestHtml('<a href="a" rel="noopener a" target="_blank">a</a>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<a href="a" target="_blank" rel="noopener a">a</a>'
    );

    setTestHtml('<a href="a" rel="a noopener b" target="_blank">a</a>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<a href="a" target="_blank" rel="a noopener b">a</a>'
    );
  });

  it('allow_unsafe_link_target (disabled)', () => {
    const ser = DomSerializer({ allow_unsafe_link_target: true });

    setTestHtml('<a href="a" target="_blank">a</a><a href="b" target="_blank">b</a>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<a href="a" target="_blank">a</a><a href="b" target="_blank">b</a>'
    );
  });

  it('format tree', () => {
    const ser = DomSerializer({ });

    setTestHtml('a');
    assert.equal(
      ser.serialize(getTestElement(), { format: 'tree' }).name,
      'body'
    );
  });

  it('Entity encoding', () => {
    let ser: DomSerializer;

    ser = DomSerializer({ entity_encoding: 'numeric' });
    setTestHtml('&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
    assert.equal(ser.serialize(getTestElement(), { getInner: true }), '&lt;&gt;&amp;"&#160;&#229;&#228;&#246;');

    ser = DomSerializer({ entity_encoding: 'named' });
    setTestHtml('&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
    assert.equal(ser.serialize(getTestElement(), { getInner: true }), '&lt;&gt;&amp;"&nbsp;&aring;&auml;&ouml;');

    ser = DomSerializer({ entity_encoding: 'named+numeric', entities: '160,nbsp,34,quot,38,amp,60,lt,62,gt' });
    setTestHtml('&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
    assert.equal(ser.serialize(getTestElement(), { getInner: true }), '&lt;&gt;&amp;"&nbsp;&#229;&#228;&#246;');

    ser = DomSerializer({ entity_encoding: 'raw' });
    setTestHtml('&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
    assert.equal(ser.serialize(getTestElement(), { getInner: true }), '&lt;&gt;&amp;"\u00a0\u00e5\u00e4\u00f6');
  });

  it('Form elements (general)', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules(
      'form[method],label[for],input[type|name|value|checked|disabled|readonly|length|maxlength],select[multiple],' +
      'option[value|selected],textarea[name|disabled|readonly]'
    );

    setTestHtml('<input type="text" />');
    assert.equal(ser.serialize(getTestElement()), '<input type="text">');

    setTestHtml('<input type="text" value="text" length="128" maxlength="129" />');
    assert.equal(ser.serialize(getTestElement()), '<input type="text" value="text" length="128" maxlength="129">');

    setTestHtml('<form method="post"><input type="hidden" name="formmethod" value="get" /></form>');
    assert.equal(ser.serialize(getTestElement()), '<form method="post"><input type="hidden" name="formmethod" value="get"></form>');

    setTestHtml('<label for="test">label</label>');
    assert.equal(ser.serialize(getTestElement()), '<label for="test">label</label>');

    setTestHtml('<input type="checkbox" value="test" /><input type="button" /><textarea></textarea>');

    // Edge will add an empty input value so remove that to normalize test since it doesn't break anything
    assert.equal(
      ser.serialize(getTestElement()).replace(/ value=""/g, ''),
      '<input type="checkbox" value="test"><input type="button"><textarea></textarea>'
    );
  });

  it('Form elements (checkbox)', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('form[method],label[for],input[type|name|value|checked|disabled|readonly|length|maxlength],select[multiple],option[value|selected]');

    setTestHtml('<input type="checkbox" value="1">');
    assert.equal(ser.serialize(getTestElement()), '<input type="checkbox" value="1">');

    setTestHtml('<input type="checkbox" value="1" checked disabled readonly>');
    assert.equal(ser.serialize(getTestElement()), '<input type="checkbox" value="1" checked="checked" disabled="disabled" readonly="readonly">');

    setTestHtml('<input type="checkbox" value="1" checked="1" disabled="1" readonly="1">');
    assert.equal(ser.serialize(getTestElement()), '<input type="checkbox" value="1" checked="checked" disabled="disabled" readonly="readonly">');

    setTestHtml('<input type="checkbox" value="1" checked="true" disabled="true" readonly="true">');
    assert.equal(ser.serialize(getTestElement()), '<input type="checkbox" value="1" checked="checked" disabled="disabled" readonly="readonly">');
  });

  it('Form elements (select)', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('form[method],label[for],input[type|name|value|checked|disabled|readonly|length|maxlength],select[multiple],option[value|selected]');

    setTestHtml('<select><option value="1">test1</option><option value="2" selected>test2</option></select>');
    assert.equal(ser.serialize(getTestElement()), '<select><option value="1">test1</option><option value="2" selected="selected">test2</option></select>');

    setTestHtml('<select><option value="1">test1</option><option selected="1" value="2">test2</option></select>');
    assert.equal(ser.serialize(getTestElement()), '<select><option value="1">test1</option><option value="2" selected="selected">test2</option></select>');

    setTestHtml('<select><option value="1">test1</option><option value="2" selected="true">test2</option></select>');
    assert.equal(ser.serialize(getTestElement()), '<select><option value="1">test1</option><option value="2" selected="selected">test2</option></select>');

    setTestHtml('<select multiple></select>');
    assert.equal(ser.serialize(getTestElement()), '<select multiple="multiple"></select>');

    setTestHtml('<select multiple="multiple"></select>');
    assert.equal(ser.serialize(getTestElement()), '<select multiple="multiple"></select>');

    setTestHtml('<select multiple="1"></select>');
    assert.equal(ser.serialize(getTestElement()), '<select multiple="multiple"></select>');

    setTestHtml('<select></select>');
    assert.equal(ser.serialize(getTestElement()), '<select></select>');
  });

  it('List elements', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('ul[compact],ol,li');

    setTestHtml('<ul compact></ul>');
    assert.equal(ser.serialize(getTestElement()), '<ul compact="compact"></ul>');

    setTestHtml('<ul compact="compact"></ul>');
    assert.equal(ser.serialize(getTestElement()), '<ul compact="compact"></ul>');

    setTestHtml('<ul compact="1"></ul>');
    assert.equal(ser.serialize(getTestElement()), '<ul compact="compact"></ul>');

    setTestHtml('<ul></ul>');
    assert.equal(ser.serialize(getTestElement()), '<ul></ul>');

    setTestHtml('<ol><li>a</li><ol><li>b</li><li>c</li></ol><li>e</li></ol>');
    assert.equal(ser.serialize(getTestElement()), '<ol><li>a<ol><li>b</li><li>c</li></ol></li><li>e</li></ol>');
  });

  it('Tables', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('table,tr,td[nowrap]');

    setTestHtml('<table><tr><td></td></tr></table>');
    assert.equal(ser.serialize(getTestElement()), '<table><tr><td></td></tr></table>');

    setTestHtml('<table><tr><td nowrap></td></tr></table>');
    assert.equal(ser.serialize(getTestElement()), '<table><tr><td nowrap="nowrap"></td></tr></table>');

    setTestHtml('<table><tr><td nowrap="nowrap"></td></tr></table>');
    assert.equal(ser.serialize(getTestElement()), '<table><tr><td nowrap="nowrap"></td></tr></table>');

    setTestHtml('<table><tr><td nowrap="1"></td></tr></table>');
    assert.equal(ser.serialize(getTestElement()), '<table><tr><td nowrap="nowrap"></td></tr></table>');
  });

  it('Styles', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('*[*]');

    setTestHtml('<span style="border: 1px solid red" data-mce-style="border: 1px solid red;">test</span>');
    assert.equal(ser.serialize(getTestElement(), { getInner: true }), '<span style="border: 1px solid red;">test</span>');
  });

  it('Comments', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('*[*]');

    setTestHtml('<!-- abc -->');
    assert.equal(ser.serialize(getTestElement(), { getInner: true }), '<!-- abc -->');
  });

  it('Non HTML elements and attributes', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('*[*]');
    ser.schema.addValidChildren('+div[prefix:test]');

    setTestHtml('<div test:attr="test">test</div>');
    assert.equal(ser.serialize(getTestElement(), { getInner: true }), '<div test:attr="test">test</div>');

    setTestHtml('test1<prefix:test>Test</prefix:test>test2');
    assert.equal(ser.serialize(getTestElement(), { getInner: true }), 'test1<prefix:test>Test</prefix:test>test2');
  });

  it('Padd empty elements', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('#p');

    setTestHtml('<p>test</p><p></p>');
    assert.equal(ser.serialize(getTestElement()), '<p>test</p><p>&nbsp;</p>');
  });

  it('TINY-9861: Pad empty elements with BR', () => {
    const ser = DomSerializer({ pad_empty_with_br: true });

    ser.setRules('#p,table,tr,#td,br');

    setTestHtml('<p>a</p><p></p>');
    assert.equal(ser.serialize(getTestElement()), '<p>a</p><p><br></p>');
    setTestHtml('<p>a</p><table><tr><td><br></td></tr></table>');
    assert.equal(ser.serialize(getTestElement()), '<p>a</p><table><tr><td><br></td></tr></table>');

    // pad empty transparent <del> element with br
    ser.setRules('-p,br,#del');
    setTestHtml('<del><p></p><br></del>');
    assert.equal(ser.serialize(getTestElement()), '<del><br></del>');
  });

  it('Do not padd empty elements with padded children', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('#p,#span,b');

    setTestHtml('<p><span></span></p><p><b><span></span></b></p>');
    assert.equal(ser.serialize(getTestElement()), '<p><span>&nbsp;</span></p><p><b><span>&nbsp;</span></b></p>');
  });

  it('Remove empty elements', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('-p');

    setTestHtml('<p>test</p><p></p>');
    assert.equal(ser.serialize(getTestElement()), '<p>test</p>');
  });

  it('Script with non JS type attribute', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<s' + 'cript type="mylanguage"></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<s' + 'cript type="mylanguage"></s' + 'cript>');
  });

  it('Script with tags inside a comment with element_format: xhtml and sanitize: false', () => {
    // TINY-8363: Disable sanitization to avoid DOMPurify false positive affecting expected output
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml', sanitize: false });
    ser.setRules('script[type|language|src]');

    setTestHtml('<s' + 'cript>// <img src="test"><a href="#"></a></s' + 'cript>');
    assert.equal(
      ser.serialize(getTestElement()).replace(/\r/g, ''),
      '<s' + 'cript>// <![CDATA[\n// <img src="test"><a href="#"></a>\n// ]]></s' + 'cript>'
    );
  });

  it('Script with tags inside a comment with sanitize: false', () => {
    // TINY-8363: Disable sanitization to avoid DOMPurify false positive affecting expected output
    const ser = DomSerializer({ fix_list_elements: true, sanitize: false });
    ser.setRules('script[type|language|src]');

    setTestHtml('<s' + 'cript>// <img src="test"><a href="#"></a></s' + 'cript>');
    assert.equal(
      ser.serialize(getTestElement()).replace(/\r/g, ''),
      '<s' + 'cript>// <img src="test"><a href="#"></a></s' + 'cript>'
    );
  });

  it('Script with less than with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    setTestHtml('<s' + 'cript>1 < 2;</s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
  });

  it('Script with less than', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<s' + 'cript>1 < 2;</s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<s' + 'cript>1 < 2;</s' + 'cript>');
  });

  it('Script with type attrib and less than with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    setTestHtml('<s' + 'cript type="text/javascript">1 < 2;</s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<script type="text/javascript">// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
  });

  it('Script with type attrib and less than', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<s' + 'cript type="text/javascript">1 < 2;</s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<script type=\"text/javascript\">1 < 2;</script>');
  });

  it('Script with whitespace in beginning/end with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script>\n\t1 < 2;\n\t if (2 < 1)\n\t\talert(1);\n</s' + 'cript>');
    assert.equal(
      ser.serialize(getTestElement()).replace(/\r/g, ''),
      '<s' + 'cript>// <![CDATA[\n\t1 < 2;\n\t if (2 < 1)\n\t\talert(1);\n// ]]></s' + 'cript>'
    );
  });

  it('Script with whitespace in beginning/end', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script>\n\t1 < 2;\n\t if (2 < 1)\n\t\talert(1);\n</s' + 'cript>');
    assert.equal(
      ser.serialize(getTestElement()).replace(/\r/g, ''),
      '<script>\n\t1 < 2;\n\t if (2 < 1)\n\t\talert(1);\n</script>'
    );
  });

  it('Script with a HTML comment and less than with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script><!-- 1 < 2; // --></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
  });

  it('Script with a HTML comment and less than', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script><!-- 1 < 2; // --></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<script><!-- 1 < 2; // --></script>');
  });

  it('Script with white space in beginning, comment and less than with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script>\n\n<!-- 1 < 2;\n\n--></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
  });

  it('Script with white space in beginning, comment and less than', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script>\n\n<!-- 1 < 2;\n\n--></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<script>\n\n<!-- 1 < 2;\n\n--></script>');
  });

  it('Script with comments and cdata with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script>// <![CDATA[1 < 2; // ]]></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
  });

  it('Script with comments and cdata', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script>// <![CDATA[1 < 2; // ]]></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<script>// <![CDATA[1 < 2; // ]]></script>');
  });

  it('Script with cdata with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script><![CDATA[1 < 2; ]]></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
  });

  it('Script with cdata', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script><![CDATA[1 < 2; ]]></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<script><![CDATA[1 < 2; ]]></script>');
  });

  it('Script whitespace in beginning/end and cdata with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script>\n\n<![CDATA[\n\n1 < 2;\n\n]]>\n\n</s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
  });

  it('Script whitespace in beginning/end and cdata', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script>\n\n<![CDATA[\n\n1 < 2;\n\n]]>\n\n</s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<script>\n\n<![CDATA[\n\n1 < 2;\n\n]]>\n\n</script>');
  });

  it('Whitespace preserve in pre', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('pre');

    setTestHtml('<pre>  </pre>');
    assert.equal(ser.serialize(getTestElement()), '<pre>  </pre>');
  });

  it('Script with src attr', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script src="test.js" data-mce-src="test.js"></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()), '<s' + 'cript src="test.js"></s' + 'cript>');
  });

  it('Script with HTML comment, comment and CDATA with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script><!--// <![CDATA[var hi = "hello";// ]]>--></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
  });

  it('Script with HTML comment, comment and CDATA', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script><!--// <![CDATA[var hi = "hello";// ]]>--></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()), '<script><!--// <![CDATA[var hi = \"hello\";// ]]>--></script>');
  });

  it('Script with block comment around cdata with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script>/* <![CDATA[ */\nvar hi = "hello";\n/* ]]> */</s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
  });

  it('Script with block comment around cdata', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script>/* <![CDATA[ */\nvar hi = "hello";\n/* ]]> */</s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()), '<script>/* <![CDATA[ */\nvar hi = \"hello\";\n/* ]]> */</script>');
  });

  it('Script with html comment and block comment around cdata with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script><!-- /* <![CDATA[ */\nvar hi = "hello";\n/* ]]>*/--></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
  });

  it('Script with html comment and block comment around cdata', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script><!-- /* <![CDATA[ */\nvar hi = "hello";\n/* ]]>*/--></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()), '<script><!-- /* <![CDATA[ */\nvar hi = \"hello\";\n/* ]]>*/--></script>');
  });

  it('Script with line comment and html comment with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script>// <!--\nvar hi = "hello";\n// --></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
  });

  it('Script with line comment and html comment', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script>// <!--\nvar hi = "hello";\n// --></s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()), '<script>// <!--\nvar hi = \"hello\";\n// --></script>');
  });

  it('Script with block comment around html comment with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script>/* <!-- */\nvar hi = "hello";\n/*-->*/</s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
  });

  it('Script with block comment around html comment', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    setTestHtml('<script>/* <!-- */\nvar hi = "hello";\n/*-->*/</s' + 'cript>');
    assert.equal(ser.serialize(getTestElement()), '<script>/* <!-- */\nvar hi = \"hello\";\n/*-->*/</script>');
  });

  it('Protected blocks', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('noscript[test]');

    setTestHtml('<!--mce:protected ' + escape('<noscript test="test"><br></noscript>') + '-->');
    assert.equal(ser.serialize(getTestElement()), '<noscript test="test"><br></noscript>');

    setTestHtml('<!--mce:protected ' + escape('<noscript><br></noscript>') + '-->');
    assert.equal(ser.serialize(getTestElement()), '<noscript><br></noscript>');

    setTestHtml('<!--mce:protected ' + escape('<noscript><!-- text --><br></noscript>') + '-->');
    assert.equal(ser.serialize(getTestElement()), '<noscript><!-- text --><br></noscript>');
  });

  it('Style with whitespace at beginning with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, valid_children: '+body[style]', element_format: 'xhtml' });
    ser.setRules('style');

    setTestHtml('<style> body { background:#fff }</style>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<style><!--\n body { background:#fff }\n--></style>');
  });

  it('Style with whitespace at beginning', () => {
    const ser = DomSerializer({ fix_list_elements: true, valid_children: '+body[style]' });
    ser.setRules('style');

    setTestHtml('<style> body { background:#fff }</style>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<style> body { background:#fff }</style>');
  });

  it('Style with cdata with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, valid_children: '+body[style]', element_format: 'xhtml' });
    ser.setRules('style');

    setTestHtml('<style>\r\n<![CDATA[\r\n   body { background:#fff }]]></style>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<style><!--\nbody { background:#fff }\n--></style>');
  });

  it('Style with cdata', () => {
    const ser = DomSerializer({ fix_list_elements: true, valid_children: '+body[style]' });
    ser.setRules('style');

    setTestHtml('<style>\r\n<![CDATA[\r\n   body { background:#fff }]]></style>');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '<style>\n<![CDATA[\n   body { background:#fff }]]></style>');
  });

  it('CDATA', () => {
    const ser = DomSerializer({ fix_list_elements: true, preserve_cdata: true });
    ser.setRules('span');

    setTestHtml('123<!--[CDATA[<test>]]-->abc');
    assert.equal(ser.serialize(getTestElement()), '123<![CDATA[<test>]]>abc');

    setTestHtml('123<!--[CDATA[<te\n\nst>]]-->abc');
    assert.equal(ser.serialize(getTestElement()).replace(/\r/g, ''), '123<![CDATA[<te\n\nst>]]>abc');
  });

  it('BR at end of blocks', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('ul,li,br');

    setTestHtml('<ul><li>test<br /></li><li>test<br /></li><li>test<br /></li></ul>');
    assert.equal(ser.serialize(getTestElement()), '<ul><li>test</li><li>test</li><li>test</li></ul>');
  });

  it('Map elements', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('map[id|name],area[shape|coords|href|target|alt]');

    DOM.setHTML(
      'test',
      '<map id="planetmap" name="planetmap"><area shape="rect" coords="0,0,82,126" href="sun.htm" data-mce-href="sun.htm" target="_blank" alt="sun" /></map>'
    );
    assert.equal(
      ser.serialize(getTestElement()).toLowerCase(),
      '<map id="planetmap" name="planetmap"><area shape="rect" coords="0,0,82,126" href="sun.htm" target="_blank" alt="sun"></map>'
    );
  });

  it('Custom elements', () => {
    const ser = DomSerializer({
      custom_elements: 'custom1,~custom2',
      valid_elements: 'custom1,custom2,#p'
    });

    document.createElement('custom1');
    document.createElement('custom2');

    setTestHtml('<p><custom1>c1</custom1><custom2>c2</custom2></p>');
    assert.equal(ser.serialize(getTestElement()), '<custom1>c1</custom1><p><custom2>c2</custom2></p>');

    setTestHtml('<custom1></custom1><p><custom2></custom2></p>');
    assert.equal(ser.serialize(getTestElement()), '<custom1></custom1><p><custom2></custom2></p>');
  });

  it('Remove internal classes', () => {
    const ser = DomSerializer({
      valid_elements: 'span[class]'
    });

    setTestHtml('<span class="a mce-item-X mce-item-selected b"></span>');
    assert.equal(ser.serialize(getTestElement()), '<span class="a b"></span>');

    setTestHtml('<span class="a mce-item-X"></span>');
    assert.equal(ser.serialize(getTestElement()), '<span class="a"></span>');

    setTestHtml('<span class="mce-item-X"></span>');
    assert.equal(ser.serialize(getTestElement()), '<span></span>');

    setTestHtml('<span class="mce-item-X b"></span>');
    assert.equal(ser.serialize(getTestElement()), '<span class=" b"></span>');

    setTestHtml('<span class="b mce-item-X"></span>');
    assert.equal(ser.serialize(getTestElement()), '<span class="b"></span>');
  });

  it('Restore tabindex', () => {
    const ser = DomSerializer({
      valid_elements: 'span[tabindex]'
    });

    setTestHtml('<span data-mce-tabindex="42"></span>');
    assert.equal(ser.serialize(getTestElement()), '<span tabindex="42"></span>');
  });

  it('Trailing BR (IE11)', () => {
    const ser = DomSerializer({
      valid_elements: 'p,br'
    });

    setTestHtml('<p>a</p><br><br>');
    assert.equal(ser.serialize(getTestElement()), '<p>a</p>');

    setTestHtml('a<br><br>');
    assert.equal(ser.serialize(getTestElement()), 'a');
  });

  it('addTempAttr', () => {
    const ser = DomSerializer({});

    ser.addTempAttr('data-x');
    ser.addTempAttr('data-y');

    setTestHtml('<p data-x="1" data-y="2" data-z="3">a</p>');
    assert.equal(ser.serialize(getTestElement(), { getInner: 1 }), '<p data-z="3">a</p>');
    assert.equal(trim(ser, '<p data-x="1" data-y="2" data-z="3">a</p>'), '<p data-z="3">a</p>');
  });

  it('addTempAttr same attr twice', () => {
    const ser1 = DomSerializer({});
    const ser2 = DomSerializer({});

    ser1.addTempAttr('data-x');
    ser2.addTempAttr('data-x');

    setTestHtml('<p data-x="1" data-z="3">a</p>');
    assert.equal(ser1.serialize(getTestElement(), { getInner: 1 }), '<p data-z="3">a</p>');
    assert.equal(trim(ser1, '<p data-x="1" data-z="3">a</p>'), '<p data-z="3">a</p>');
    assert.equal(ser2.serialize(getTestElement(), { getInner: 1 }), '<p data-z="3">a</p>');
    assert.equal(trim(ser2, '<p data-x="1" data-z="3">a</p>'), '<p data-z="3">a</p>');
  });

  it('trim data-mce-bogus="all"', () => {
    const ser = DomSerializer({});

    setTestHtml('a<p data-mce-bogus="all">b</p>c');
    assert.equal(ser.serialize(getTestElement(), { getInner: 1 }), 'ac');
    assert.equal(trim(ser, 'a<p data-mce-bogus="all">b</p>c'), 'ac');
  });

  it('zwsp should not be treated as contents', () => {
    const ser = DomSerializer({ });

    setTestHtml('<p>' + Zwsp.ZWSP + '</p>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<p>&nbsp;</p>'
    );
  });

  it('nested bookmark nodes', () => {
    const ser = DomSerializer({ });

    setTestHtml('<p>' +
      '<span data-mce-type="bookmark" id="mce_5_start" data-mce-style="overflow:hidden;line-height:0px" style="overflow:hidden;line-height:0px">' +
        '<span data-mce-type="bookmark" id="mce_6_start" data-mce-style="overflow:hidden;line-height:0px" style="overflow:hidden;line-height:0px"></span>' +
        '<span data-mce-type="bookmark" id="mce_7_start" data-mce-style="overflow:hidden;line-height:0px" style="overflow:hidden;line-height:0px"></span>' +
      '</span>' +
      'a' +
      '<span data-mce-type="bookmark" id="mce_10_start" data-mce-style="overflow:hidden;line-height:0px" style="overflow:hidden;line-height:0px"></span>' +
      '<span data-mce-type="bookmark" id="mce_9_start" data-mce-style="overflow:hidden;line-height:0px" style="overflow:hidden;line-height:0px"></span>' +
      '<span data-mce-type="bookmark" id="mce_8_start" data-mce-style="overflow:hidden;line-height:0px" style="overflow:hidden;line-height:0px"></span>' +
    '</p>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<p>a</p>'
    );
  });

  it('addNodeFilter/addAttributeFilter', () => {
    const ser = DomSerializer({ });
    const nodeFilter = Fun.noop;
    const attrFilter = Fun.noop;

    ser.addNodeFilter('some-tag', nodeFilter);
    ser.addAttributeFilter('data-something', attrFilter);

    const lastNodeFilter = Arr.last(ser.getNodeFilters()).getOrDie('Failed to get filter');
    const lastAttributeFilter = Arr.last(ser.getAttributeFilters()).getOrDie('Failed to get filter');

    assert.equal(lastNodeFilter.name, 'some-tag', 'Should be the last registered filter element name');
    assert.equal(lastNodeFilter.callbacks[0], nodeFilter, 'Should be the last registered node filter function');
    assert.equal(lastAttributeFilter.name, 'data-something', 'Should be the last registered filter attribute name');
    assert.equal(lastAttributeFilter.callbacks[0], attrFilter, 'Should be the last registered attribute filter function');
  });

  it('TINY-7847: removeNodeFilter/removeAttributeFilter', () => {
    const ser = DomSerializer({ });
    const nodeFilter = Fun.noop;
    const attrFilter = Fun.noop;
    const numNodeFilters = ser.getNodeFilters().length;
    const numAttrFilters = ser.getAttributeFilters().length;

    ser.addNodeFilter('some-tag', nodeFilter);
    ser.addAttributeFilter('data-something', attrFilter);

    assert.lengthOf(ser.getNodeFilters(), numNodeFilters + 1, 'Number of node filters');
    assert.lengthOf(ser.getAttributeFilters(), numAttrFilters + 1, 'Number of attribute filters');

    ser.removeNodeFilter('some-tag', nodeFilter);
    ser.removeAttributeFilter('data-something', attrFilter);

    assert.lengthOf(ser.getNodeFilters(), numNodeFilters, 'Number of node filters');
    assert.lengthOf(ser.getAttributeFilters(), numAttrFilters, 'Number of attribute filters');
  });

  it('TINY-9172: Should remove the internal data-mce-block attribute for transparent block elements', () => {
    const ser = DomSerializer({ });

    setTestHtml('<a href="#" data-mce-block="true"><p>block</p></a>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<a href="#"><p>block</p></a>'
    );
  });

  it('TINY-3909: Remove redundant br elements', () => {
    const ser = DomSerializer({ remove_trailing_brs: true });

    setTestHtml( '<p>a<br></p>' +
      '<p>a<br>b<br></p>' +
      '<p>a<br><br></p><p>a<br><span data-mce-type="bookmark"></span><br></p>' +
      '<p>a<span data-mce-type="bookmark"></span><br></p>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<p>a</p><p>a<br>b</p><p>a<br><br></p><p>a<br><br></p><p>a</p>',
      'Should remove redundant br elements');
  });

  it('TINY-3909: Replace br with nbsp when wrapped in two inline elements and one block element', () => {
    const ser = DomSerializer({ remove_trailing_brs: true });

    setTestHtml('<p><strong><em><br /></em></strong></p>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<p><strong><em>&nbsp;</em></strong></p>',
      'Should replace br with nbsp');
  });

  it('TINY-3909: Replace br with nbsp when wrapped in an inline element and placed in the root', () => {
    const ser = DomSerializer({ remove_trailing_brs: true });

    setTestHtml('<strong><br /></strong>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<strong>&nbsp;</strong>',
      'Should replace br with nbsp');
  });

  it('TINY-3909: Don\'t replace br inside root element when there is multiple brs', () => {
    const ser = DomSerializer({ remove_trailing_brs: true });

    setTestHtml('<strong><br /><br /></strong>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<strong><br><br></strong>',
      'Should not replace br with nbsp');
  });

  it('TINY-3909: Don\'t replace br inside root element when there is siblings', () => {
    const ser = DomSerializer({ remove_trailing_brs: true });

    setTestHtml('<strong><br /></strong><em>x</em>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '<strong><br></strong><em>x</em>',
      'Should not replace br with nbsp');
  });

  it('TINY-3909: Remove br in invalid parent bug', () => {
    const ser = DomSerializer({ remove_trailing_brs: true });

    ser.setRules('br');
    setTestHtml('<br>');
    assert.equal(
      ser.serialize(getTestElement(), { getInner: true }),
      '',
      'Should remove br');
  });
});


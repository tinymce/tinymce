import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import DomSerializer from 'tinymce/core/api/dom/Serializer';
import * as TrimHtml from 'tinymce/core/dom/TrimHtml';
import * as Zwsp from 'tinymce/core/text/Zwsp';

import * as ViewBlock from '../../module/test/ViewBlock';

declare const escape: any;

describe('browser.tinymce.core.dom.SerializerTest', () => {
  const DOM = DOMUtils.DOM;
  const viewBlock = ViewBlock.bddSetup();
  viewBlock.get().id = 'test';

  afterEach(() => {
    viewBlock.update('');
  });

  it('Schema rules', () => {
    let ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('@[id|title|class|style],div,img[src|alt|-style|border],span,hr');
    DOM.setHTML('test', '<img title="test" src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" alt="test" ' +
      'border="0" style="border: 1px solid red" class="test" /><span id="test2">test</span><hr />');
    assert.equal(
      ser.serialize(DOM.get('test'), { getInner: true }),
      '<img title="test" class="test" src="tinymce/ui/img/raster.gif" ' +
      'alt="test" border="0" /><span id="test2">test</span><hr />', 'Global rule'
    );

    ser.setRules('*a[*],em/i[*],strong/b[*i*]');
    DOM.setHTML('test', '<a href="test" data-mce-href="test">test</a><strong title="test" class="test">test2</strong><em title="test">test3</em>');
    assert.equal(ser.serialize(DOM.get('test')), '<a href="test">test</a><strong title="test">test2</strong><em title="test">' +
      'test3</em>', 'Wildcard rules');

    ser.setRules('br,hr,input[type|name|value],div[id],span[id],strong/b,a,em/i,a[!href|!name],img[src|border=0|title={$uid}]');
    DOM.setHTML('test', '<br /><hr /><input type="text" name="test" value="val" class="no" />' +
      '<span id="test2" class="no"><b class="no">abc</b><em class="no">123</em></span>123<a href="file.html" ' +
      'data-mce-href="file.html">link</a><a name="anchor"></a><a>no</a><img src="tinymce/ui/img/raster.gif" ' +
      'data-mce-src="tinymce/ui/img/raster.gif" />');
    assert.equal(ser.serialize(DOM.get('test')), '<div id="test"><br /><hr /><input type="text" name="test" value="val" />' +
      '<span id="test2"><strong>abc</strong><em>123</em></span>123<a href="file.html">link</a>' +
      '<a name="anchor"></a>no<img src="tinymce/ui/img/raster.gif" border="0" title="mce_0" /></div>', 'Output name and attribute rules');

    ser.setRules('img[src|border=0|alt=]');
    DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" border="0" alt="" />');
    assert.equal(ser.serialize(DOM.get('test')), '<img src="tinymce/ui/img/raster.gif" border="0" alt="" />', 'Default attribute with empty value');

    ser.setRules('img[src|border=0|alt=],div[style|id],*[*]');
    DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" /><hr />');
    assert.equal(
      ser.serialize(DOM.get('test'), { getInner: true }),
      '<img src="tinymce/ui/img/raster.gif" border="0" alt="" /><hr />'
    );

    ser = DomSerializer({
      valid_elements: 'img[src|border=0|alt=]',
      extended_valid_elements: 'div[id],img[src|alt=]'
    });
    DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" alt="" />');
    assert.equal(
      ser.serialize(DOM.get('test')),
      '<div id="test"><img src="tinymce/ui/img/raster.gif" alt="" /></div>'
    );

    ser = DomSerializer({ invalid_elements: 'hr,br' });
    DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" /><hr /><br />');
    assert.equal(
      ser.serialize(DOM.get('test'), { getInner: true }),
      '<img src="tinymce/ui/img/raster.gif" />'
    );
  });

  it('allow_unsafe_link_target (default)', () => {
    const ser = DomSerializer({ });

    DOM.setHTML('test', '<a href="a" target="_blank">a</a><a href="b" target="_blank">b</a>');
    assert.equal(
      ser.serialize(DOM.get('test'), { getInner: true }),
      '<a href="a" target="_blank" rel="noopener">a</a><a href="b" target="_blank" rel="noopener">b</a>'
    );

    DOM.setHTML('test', '<a href="a" rel="lightbox" target="_blank">a</a><a href="b" rel="lightbox" target="_blank">b</a>');
    assert.equal(
      ser.serialize(DOM.get('test'), { getInner: true }),
      '<a href="a" target="_blank" rel="lightbox noopener">a</a><a href="b" target="_blank" rel="lightbox noopener">b</a>'
    );

    DOM.setHTML('test', '<a href="a" rel="lightbox x" target="_blank">a</a><a href="b" rel="lightbox x" target="_blank">b</a>');
    assert.equal(
      ser.serialize(DOM.get('test'), { getInner: true }),
      '<a href="a" target="_blank" rel="lightbox noopener x">a</a><a href="b" target="_blank" rel="lightbox noopener x">b</a>'
    );

    DOM.setHTML('test', '<a href="a" rel="noopener a" target="_blank">a</a>');
    assert.equal(
      ser.serialize(DOM.get('test'), { getInner: true }),
      '<a href="a" target="_blank" rel="noopener a">a</a>'
    );

    DOM.setHTML('test', '<a href="a" rel="a noopener b" target="_blank">a</a>');
    assert.equal(
      ser.serialize(DOM.get('test'), { getInner: true }),
      '<a href="a" target="_blank" rel="a noopener b">a</a>'
    );
  });

  it('allow_unsafe_link_target (disabled)', () => {
    const ser = DomSerializer({ allow_unsafe_link_target: true });

    DOM.setHTML('test', '<a href="a" target="_blank">a</a><a href="b" target="_blank">b</a>');
    assert.equal(
      ser.serialize(DOM.get('test'), { getInner: true }),
      '<a href="a" target="_blank">a</a><a href="b" target="_blank">b</a>'
    );
  });

  it('format tree', () => {
    const ser = DomSerializer({ });

    DOM.setHTML('test', 'a');
    assert.equal(
      ser.serialize(DOM.get('test'), { format: 'tree' }).name,
      'body'
    );
  });

  it('Entity encoding', () => {
    let ser: DomSerializer;

    ser = DomSerializer({ entity_encoding: 'numeric' });
    DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
    assert.equal(ser.serialize(DOM.get('test'), { getInner: true }), '&lt;&gt;&amp;"&#160;&#229;&#228;&#246;');

    ser = DomSerializer({ entity_encoding: 'named' });
    DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
    assert.equal(ser.serialize(DOM.get('test'), { getInner: true }), '&lt;&gt;&amp;"&nbsp;&aring;&auml;&ouml;');

    ser = DomSerializer({ entity_encoding: 'named+numeric', entities: '160,nbsp,34,quot,38,amp,60,lt,62,gt' });
    DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
    assert.equal(ser.serialize(DOM.get('test'), { getInner: true }), '&lt;&gt;&amp;"&nbsp;&#229;&#228;&#246;');

    ser = DomSerializer({ entity_encoding: 'raw' });
    DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
    assert.equal(ser.serialize(DOM.get('test'), { getInner: true }), '&lt;&gt;&amp;"\u00a0\u00e5\u00e4\u00f6');
  });

  it('Form elements (general)', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules(
      'form[method],label[for],input[type|name|value|checked|disabled|readonly|length|maxlength],select[multiple],' +
      'option[value|selected],textarea[name|disabled|readonly]'
    );

    DOM.setHTML('test', '<input type="text" />');
    assert.equal(ser.serialize(DOM.get('test')), '<input type="text" />');

    DOM.setHTML('test', '<input type="text" value="text" length="128" maxlength="129" />');
    assert.equal(ser.serialize(DOM.get('test')), '<input type="text" value="text" length="128" maxlength="129" />');

    DOM.setHTML('test', '<form method="post"><input type="hidden" name="formmethod" value="get" /></form>');
    assert.equal(ser.serialize(DOM.get('test')), '<form method="post"><input type="hidden" name="formmethod" value="get" /></form>');

    DOM.setHTML('test', '<label for="test">label</label>');
    assert.equal(ser.serialize(DOM.get('test')), '<label for="test">label</label>');

    DOM.setHTML('test', '<input type="checkbox" value="test" /><input type="button" /><textarea></textarea>');

    // Edge will add an empty input value so remove that to normalize test since it doesn't break anything
    assert.equal(
      ser.serialize(DOM.get('test')).replace(/ value=""/g, ''),
      '<input type="checkbox" value="test" /><input type="button" /><textarea></textarea>'
    );
  });

  it('Form elements (checkbox)', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('form[method],label[for],input[type|name|value|checked|disabled|readonly|length|maxlength],select[multiple],option[value|selected]');

    DOM.setHTML('test', '<input type="checkbox" value="1">');
    assert.equal(ser.serialize(DOM.get('test')), '<input type="checkbox" value="1" />');

    DOM.setHTML('test', '<input type="checkbox" value="1" checked disabled readonly>');
    assert.equal(ser.serialize(DOM.get('test')), '<input type="checkbox" value="1" checked="checked" disabled="disabled" readonly="readonly" />');

    DOM.setHTML('test', '<input type="checkbox" value="1" checked="1" disabled="1" readonly="1">');
    assert.equal(ser.serialize(DOM.get('test')), '<input type="checkbox" value="1" checked="checked" disabled="disabled" readonly="readonly" />');

    DOM.setHTML('test', '<input type="checkbox" value="1" checked="true" disabled="true" readonly="true">');
    assert.equal(ser.serialize(DOM.get('test')), '<input type="checkbox" value="1" checked="checked" disabled="disabled" readonly="readonly" />');
  });

  it('Form elements (select)', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('form[method],label[for],input[type|name|value|checked|disabled|readonly|length|maxlength],select[multiple],option[value|selected]');

    DOM.setHTML('test', '<select><option value="1">test1</option><option value="2" selected>test2</option></select>');
    assert.equal(ser.serialize(DOM.get('test')), '<select><option value="1">test1</option><option value="2" selected="selected">test2</option></select>');

    DOM.setHTML('test', '<select><option value="1">test1</option><option selected="1" value="2">test2</option></select>');
    assert.equal(ser.serialize(DOM.get('test')), '<select><option value="1">test1</option><option value="2" selected="selected">test2</option></select>');

    DOM.setHTML('test', '<select><option value="1">test1</option><option value="2" selected="true">test2</option></select>');
    assert.equal(ser.serialize(DOM.get('test')), '<select><option value="1">test1</option><option value="2" selected="selected">test2</option></select>');

    DOM.setHTML('test', '<select multiple></select>');
    assert.equal(ser.serialize(DOM.get('test')), '<select multiple="multiple"></select>');

    DOM.setHTML('test', '<select multiple="multiple"></select>');
    assert.equal(ser.serialize(DOM.get('test')), '<select multiple="multiple"></select>');

    DOM.setHTML('test', '<select multiple="1"></select>');
    assert.equal(ser.serialize(DOM.get('test')), '<select multiple="multiple"></select>');

    DOM.setHTML('test', '<select></select>');
    assert.equal(ser.serialize(DOM.get('test')), '<select></select>');
  });

  it('List elements', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('ul[compact],ol,li');

    DOM.setHTML('test', '<ul compact></ul>');
    assert.equal(ser.serialize(DOM.get('test')), '<ul compact="compact"></ul>');

    DOM.setHTML('test', '<ul compact="compact"></ul>');
    assert.equal(ser.serialize(DOM.get('test')), '<ul compact="compact"></ul>');

    DOM.setHTML('test', '<ul compact="1"></ul>');
    assert.equal(ser.serialize(DOM.get('test')), '<ul compact="compact"></ul>');

    DOM.setHTML('test', '<ul></ul>');
    assert.equal(ser.serialize(DOM.get('test')), '<ul></ul>');

    DOM.setHTML('test', '<ol><li>a</li><ol><li>b</li><li>c</li></ol><li>e</li></ol>');
    assert.equal(ser.serialize(DOM.get('test')), '<ol><li>a<ol><li>b</li><li>c</li></ol></li><li>e</li></ol>');
  });

  it('Tables', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('table,tr,td[nowrap]');

    DOM.setHTML('test', '<table><tr><td></td></tr></table>');
    assert.equal(ser.serialize(DOM.get('test')), '<table><tr><td></td></tr></table>');

    DOM.setHTML('test', '<table><tr><td nowrap></td></tr></table>');
    assert.equal(ser.serialize(DOM.get('test')), '<table><tr><td nowrap="nowrap"></td></tr></table>');

    DOM.setHTML('test', '<table><tr><td nowrap="nowrap"></td></tr></table>');
    assert.equal(ser.serialize(DOM.get('test')), '<table><tr><td nowrap="nowrap"></td></tr></table>');

    DOM.setHTML('test', '<table><tr><td nowrap="1"></td></tr></table>');
    assert.equal(ser.serialize(DOM.get('test')), '<table><tr><td nowrap="nowrap"></td></tr></table>');
  });

  it('Styles', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('*[*]');

    DOM.setHTML('test', '<span style="border: 1px solid red" data-mce-style="border: 1px solid red;">test</span>');
    assert.equal(ser.serialize(DOM.get('test'), { getInner: true }), '<span style="border: 1px solid red;">test</span>');
  });

  it('Comments', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('*[*]');

    DOM.setHTML('test', '<!-- abc -->');
    assert.equal(ser.serialize(DOM.get('test'), { getInner: true }), '<!-- abc -->');
  });

  it('Non HTML elements and attributes', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('*[*]');
    ser.schema.addValidChildren('+div[prefix:test]');

    DOM.setHTML('test', '<div test:attr="test">test</div>');
    assert.equal(ser.serialize(DOM.get('test'), { getInner: true }), '<div test:attr="test">test</div>');

    DOM.setHTML('test', 'test1<prefix:test>Test</prefix:test>test2');
    assert.equal(ser.serialize(DOM.get('test'), { getInner: true }), 'test1<prefix:test>Test</prefix:test>test2');
  });

  it('Padd empty elements', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('#p');

    DOM.setHTML('test', '<p>test</p><p></p>');
    assert.equal(ser.serialize(DOM.get('test')), '<p>test</p><p>&nbsp;</p>');
  });

  it('Padd empty elements with BR', () => {
    const ser = DomSerializer({ padd_empty_with_br: true });

    ser.setRules('#p,table,tr,#td,br');

    DOM.setHTML('test', '<p>a</p><p></p>');
    assert.equal(ser.serialize(DOM.get('test')), '<p>a</p><p><br /></p>');
    DOM.setHTML('test', '<p>a</p><table><tr><td><br></td></tr></table>');
    assert.equal(ser.serialize(DOM.get('test')), '<p>a</p><table><tr><td><br /></td></tr></table>');
  });

  it('Do not padd empty elements with padded children', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('#p,#span,b');

    DOM.setHTML('test', '<p><span></span></p><p><b><span></span></b></p>');
    assert.equal(ser.serialize(DOM.get('test')), '<p><span>&nbsp;</span></p><p><b><span>&nbsp;</span></b></p>');
  });

  it('Remove empty elements', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('-p');

    DOM.setHTML('test', '<p>test</p><p></p>');
    assert.equal(ser.serialize(DOM.get('test')), '<p>test</p>');
  });

  it('Script with non JS type attribute', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<s' + 'cript type="mylanguage"></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript type="mylanguage"></s' + 'cript>');
  });

  it('Script with tags inside a comment with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<s' + 'cript>// <img src="test"><a href="#"></a></s' + 'cript>');
    assert.equal(
      ser.serialize(DOM.get('test')).replace(/\r/g, ''),
      '<s' + 'cript>// <![CDATA[\n// <img src="test"><a href="#"></a>\n// ]]></s' + 'cript>'
    );
  });

  it('Script with tags inside a comment', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<s' + 'cript>// <img src="test"><a href="#"></a></s' + 'cript>');
    assert.equal(
      ser.serialize(DOM.get('test')).replace(/\r/g, ''),
      '<s' + 'cript>// <img src="test"><a href="#"></a></s' + 'cript>'
    );
  });

  it('Script with less than with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<s' + 'cript>1 < 2;</s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
  });

  it('Script with less than', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<s' + 'cript>1 < 2;</s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>1 < 2;</s' + 'cript>');
  });

  it('Script with type attrib and less than with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<s' + 'cript type="text/javascript">1 < 2;</s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script type="text/javascript">// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
  });

  it('Script with type attrib and less than', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<s' + 'cript type="text/javascript">1 < 2;</s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script type=\"text/javascript\">1 < 2;</script>');
  });

  it('Script with whitespace in beginning/end with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script>\n\t1 < 2;\n\t if (2 < 1)\n\t\talert(1);\n</s' + 'cript>');
    assert.equal(
      ser.serialize(DOM.get('test')).replace(/\r/g, ''),
      '<s' + 'cript>// <![CDATA[\n\t1 < 2;\n\t if (2 < 1)\n\t\talert(1);\n// ]]></s' + 'cript>'
    );
  });

  it('Script with whitespace in beginning/end', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script>\n\t1 < 2;\n\t if (2 < 1)\n\t\talert(1);\n</s' + 'cript>');
    assert.equal(
      ser.serialize(DOM.get('test')).replace(/\r/g, ''),
      '<script>\n\t1 < 2;\n\t if (2 < 1)\n\t\talert(1);\n</script>'
    );
  });

  it('Script with a HTML comment and less than with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script><!-- 1 < 2; // --></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
  });

  it('Script with a HTML comment and less than', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script><!-- 1 < 2; // --></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script><!-- 1 < 2; // --></script>');
  });

  it('Script with white space in beginning, comment and less than with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script>\n\n<!-- 1 < 2;\n\n--></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
  });

  it('Script with white space in beginning, comment and less than', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script>\n\n<!-- 1 < 2;\n\n--></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script>\n\n<!-- 1 < 2;\n\n--></script>');
  });

  it('Script with comments and cdata with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script>// <![CDATA[1 < 2; // ]]></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
  });

  it('Script with comments and cdata', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script>// <![CDATA[1 < 2; // ]]></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script>// <![CDATA[1 < 2; // ]]></script>');
  });

  it('Script with cdata with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script><![CDATA[1 < 2; ]]></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
  });

  it('Script with cdata', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script><![CDATA[1 < 2; ]]></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script><![CDATA[1 < 2; ]]></script>');
  });

  it('Script whitespace in beginning/end and cdata with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script>\n\n<![CDATA[\n\n1 < 2;\n\n]]>\n\n</s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
  });

  it('Script whitespace in beginning/end and cdata', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script>\n\n<![CDATA[\n\n1 < 2;\n\n]]>\n\n</s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script>\n\n<![CDATA[\n\n1 < 2;\n\n]]>\n\n</script>');
  });

  it('Whitespace preserve in pre', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('pre');

    DOM.setHTML('test', '<pre>  </pre>');
    assert.equal(ser.serialize(DOM.get('test')), '<pre>  </pre>');
  });

  it('Script with src attr', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script src="test.js" data-mce-src="test.js"></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')), '<s' + 'cript src="test.js"></s' + 'cript>');
  });

  it('Script with HTML comment, comment and CDATA with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script><!--// <![CDATA[var hi = "hello";// ]]>--></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
  });

  it('Script with HTML comment, comment and CDATA', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script><!--// <![CDATA[var hi = "hello";// ]]>--></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')), '<script><!--// <![CDATA[var hi = \"hello\";// ]]>--></script>');
  });

  it('Script with block comment around cdata with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script>/* <![CDATA[ */\nvar hi = "hello";\n/* ]]> */</s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
  });

  it('Script with block comment around cdata', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script>/* <![CDATA[ */\nvar hi = "hello";\n/* ]]> */</s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')), '<script>/* <![CDATA[ */\nvar hi = \"hello\";\n/* ]]> */</script>');
  });

  it('Script with html comment and block comment around cdata with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script><!-- /* <![CDATA[ */\nvar hi = "hello";\n/* ]]>*/--></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
  });

  it('Script with html comment and block comment around cdata', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script><!-- /* <![CDATA[ */\nvar hi = "hello";\n/* ]]>*/--></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')), '<script><!-- /* <![CDATA[ */\nvar hi = \"hello\";\n/* ]]>*/--></script>');
  });

  it('Script with line comment and html comment with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script>// <!--\nvar hi = "hello";\n// --></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
  });

  it('Script with line comment and html comment', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script>// <!--\nvar hi = "hello";\n// --></s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')), '<script>// <!--\nvar hi = \"hello\";\n// --></script>');
  });

  it('Script with block comment around html comment with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, element_format: 'xhtml' });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script>/* <!-- */\nvar hi = "hello";\n/*-->*/</s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
  });

  it('Script with block comment around html comment', () => {
    const ser = DomSerializer({ fix_list_elements: true });
    ser.setRules('script[type|language|src]');

    DOM.setHTML('test', '<script>/* <!-- */\nvar hi = "hello";\n/*-->*/</s' + 'cript>');
    assert.equal(ser.serialize(DOM.get('test')), '<script>/* <!-- */\nvar hi = \"hello\";\n/*-->*/</script>');
  });

  it('Protected blocks', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('noscript[test]');

    DOM.setHTML('test', '<!--mce:protected ' + escape('<noscript test="test"><br></noscript>') + '-->');
    assert.equal(ser.serialize(DOM.get('test')), '<noscript test="test"><br></noscript>');

    DOM.setHTML('test', '<!--mce:protected ' + escape('<noscript><br></noscript>') + '-->');
    assert.equal(ser.serialize(DOM.get('test')), '<noscript><br></noscript>');

    DOM.setHTML('test', '<!--mce:protected ' + escape('<noscript><!-- text --><br></noscript>') + '-->');
    assert.equal(ser.serialize(DOM.get('test')), '<noscript><!-- text --><br></noscript>');
  });

  it('Style with whitespace at beginning with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, valid_children: '+body[style]', element_format: 'xhtml' });
    ser.setRules('style');

    DOM.setHTML('test', '<style> body { background:#fff }</style>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<style><!--\n body { background:#fff }\n--></style>');
  });

  it('Style with whitespace at beginning', () => {
    const ser = DomSerializer({ fix_list_elements: true, valid_children: '+body[style]' });
    ser.setRules('style');

    DOM.setHTML('test', '<style> body { background:#fff }</style>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<style> body { background:#fff }</style>');
  });

  it('Style with cdata with element_format: xhtml', () => {
    const ser = DomSerializer({ fix_list_elements: true, valid_children: '+body[style]', element_format: 'xhtml' });
    ser.setRules('style');

    DOM.setHTML('test', '<style>\r\n<![CDATA[\r\n   body { background:#fff }]]></style>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<style><!--\nbody { background:#fff }\n--></style>');
  });

  it('Style with cdata', () => {
    const ser = DomSerializer({ fix_list_elements: true, valid_children: '+body[style]' });
    ser.setRules('style');

    DOM.setHTML('test', '<style>\r\n<![CDATA[\r\n   body { background:#fff }]]></style>');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<style>\n<![CDATA[\n   body { background:#fff }]]></style>');
  });

  it('CDATA', () => {
    const ser = DomSerializer({ fix_list_elements: true, preserve_cdata: true });
    ser.setRules('span');

    DOM.setHTML('test', '123<!--[CDATA[<test>]]-->abc');
    assert.equal(ser.serialize(DOM.get('test')), '123<![CDATA[<test>]]>abc');

    DOM.setHTML('test', '123<!--[CDATA[<te\n\nst>]]-->abc');
    assert.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '123<![CDATA[<te\n\nst>]]>abc');
  });

  it('BR at end of blocks', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('ul,li,br');

    DOM.setHTML('test', '<ul><li>test<br /></li><li>test<br /></li><li>test<br /></li></ul>');
    assert.equal(ser.serialize(DOM.get('test')), '<ul><li>test</li><li>test</li><li>test</li></ul>');
  });

  it('Map elements', () => {
    const ser = DomSerializer({ fix_list_elements: true });

    ser.setRules('map[id|name],area[shape|coords|href|target|alt]');

    DOM.setHTML(
      'test',
      '<map id="planetmap" name="planetmap"><area shape="rect" coords="0,0,82,126" href="sun.htm" data-mce-href="sun.htm" target="_blank" alt="sun" /></map>'
    );
    assert.equal(
      ser.serialize(DOM.get('test')).toLowerCase(),
      '<map id="planetmap" name="planetmap"><area shape="rect" coords="0,0,82,126" href="sun.htm" target="_blank" alt="sun" /></map>'
    );
  });

  it('Custom elements', () => {
    const ser = DomSerializer({
      custom_elements: 'custom1,~custom2',
      valid_elements: 'custom1,custom2'
    });

    document.createElement('custom1');
    document.createElement('custom2');

    DOM.setHTML('test', '<p><custom1>c1</custom1><custom2>c2</custom2></p>');
    assert.equal(ser.serialize(DOM.get('test')), '<custom1>c1</custom1><custom2>c2</custom2>');
  });

  it('Remove internal classes', () => {
    const ser = DomSerializer({
      valid_elements: 'span[class]'
    });

    DOM.setHTML('test', '<span class="a mce-item-X mce-item-selected b"></span>');
    assert.equal(ser.serialize(DOM.get('test')), '<span class="a b"></span>');

    DOM.setHTML('test', '<span class="a mce-item-X"></span>');
    assert.equal(ser.serialize(DOM.get('test')), '<span class="a"></span>');

    DOM.setHTML('test', '<span class="mce-item-X"></span>');
    assert.equal(ser.serialize(DOM.get('test')), '<span></span>');

    DOM.setHTML('test', '<span class="mce-item-X b"></span>');
    assert.equal(ser.serialize(DOM.get('test')), '<span class=" b"></span>');

    DOM.setHTML('test', '<span class="b mce-item-X"></span>');
    assert.equal(ser.serialize(DOM.get('test')), '<span class="b"></span>');
  });

  it('Restore tabindex', () => {
    const ser = DomSerializer({
      valid_elements: 'span[tabindex]'
    });

    DOM.setHTML('test', '<span data-mce-tabindex="42"></span>');
    assert.equal(ser.serialize(DOM.get('test')), '<span tabindex="42"></span>');
  });

  it('Trailing BR (IE11)', () => {
    const ser = DomSerializer({
      valid_elements: 'p,br'
    });

    DOM.setHTML('test', '<p>a</p><br><br>');
    assert.equal(ser.serialize(DOM.get('test')), '<p>a</p>');

    DOM.setHTML('test', 'a<br><br>');
    assert.equal(ser.serialize(DOM.get('test')), 'a');
  });

  it('addTempAttr', () => {
    const ser = DomSerializer({});

    ser.addTempAttr('data-x');
    ser.addTempAttr('data-y');

    DOM.setHTML('test', '<p data-x="1" data-y="2" data-z="3">a</p>');
    assert.equal(ser.serialize(DOM.get('test'), { getInner: 1 }), '<p data-z="3">a</p>');
    assert.equal(TrimHtml.trimExternal(ser, '<p data-x="1" data-y="2" data-z="3">a</p>'), '<p data-z="3">a</p>');
  });

  it('addTempAttr same attr twice', () => {
    const ser1 = DomSerializer({});
    const ser2 = DomSerializer({});

    ser1.addTempAttr('data-x');
    ser2.addTempAttr('data-x');

    DOM.setHTML('test', '<p data-x="1" data-z="3">a</p>');
    assert.equal(ser1.serialize(DOM.get('test'), { getInner: 1 }), '<p data-z="3">a</p>');
    assert.equal(TrimHtml.trimExternal(ser1, '<p data-x="1" data-z="3">a</p>'), '<p data-z="3">a</p>');
    assert.equal(ser2.serialize(DOM.get('test'), { getInner: 1 }), '<p data-z="3">a</p>');
    assert.equal(TrimHtml.trimExternal(ser2, '<p data-x="1" data-z="3">a</p>'), '<p data-z="3">a</p>');
  });

  it('trim data-mce-bougs="all"', () => {
    const ser = DomSerializer({});

    DOM.setHTML('test', 'a<p data-mce-bogus="all">b</p>c');
    assert.equal(ser.serialize(DOM.get('test'), { getInner: 1 }), 'ac');
    assert.equal(TrimHtml.trimExternal(ser, 'a<p data-mce-bogus="all">b</p>c'), 'ac');
  });

  it('zwsp should not be treated as contents', () => {
    const ser = DomSerializer({ });

    DOM.setHTML('test', '<p>' + Zwsp.ZWSP + '</p>');
    assert.equal(
      ser.serialize(DOM.get('test'), { getInner: true }),
      '<p>&nbsp;</p>'
    );
  });

  it('nested bookmark nodes', () => {
    const ser = DomSerializer({ });

    DOM.setHTML('test', '<p>' +
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
      ser.serialize(DOM.get('test'), { getInner: true }),
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
});

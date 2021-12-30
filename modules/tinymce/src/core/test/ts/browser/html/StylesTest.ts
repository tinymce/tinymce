import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Schema from 'tinymce/core/api/html/Schema';
import Styles from 'tinymce/core/api/html/Styles';

describe('browser.tinymce.core.html.StylesTest', () => {
  it('Basic parsing/serializing', () => {
    const styles = Styles();

    assert.equal(styles.serialize(styles.parse('FONT-SIZE:10px')), 'font-size: 10px;');
    assert.equal(styles.serialize(styles.parse('FONT-SIZE:10px;COLOR:red')), 'font-size: 10px; color: red;');
    assert.equal(styles.serialize(styles.parse('   FONT-SIZE  :  10px  ;   COLOR  :  red   ')), 'font-size: 10px; color: red;');
    assert.equal(styles.serialize(styles.parse('key:"value"')), `key: 'value';`);
    assert.equal(styles.serialize(styles.parse(`key:"value1" 'value2'`)), `key: 'value1' 'value2';`);
    assert.equal(styles.serialize(styles.parse(`key:"val\\"ue1" 'val\\'ue2'`)), `key: 'val"ue1' 'val\\'ue2';`);
    assert.equal(styles.serialize(styles.parse('width:100%')), 'width: 100%;');
    assert.equal(styles.serialize(styles.parse('value:_; value2:"_"')), `value: _; value2: '_';`);
    assert.equal(styles.serialize(styles.parse('value: "&amp;"')), `value: '&amp;';`);
    assert.equal(styles.serialize(styles.parse('value: "&"')), `value: '&';`);
    assert.equal(styles.serialize(styles.parse('value: ')), '');
    assert.equal(
      styles.serialize(styles.parse(`background: url('http://www.site.com/(foo)');`)),
      `background: url('http://www.site.com/(foo)');`
    );
  });

  it('Colors force hex and lowercase', () => {
    const styles = Styles();

    assert.equal(styles.serialize(styles.parse('color: rgb(1,2,3)')), 'color: rgb(1,2,3);');
    assert.equal(styles.serialize(styles.parse('color: RGB(1,2,3)')), 'color: rgb(1,2,3);');
    assert.equal(styles.serialize(styles.parse('color: #FF0000')), 'color: #ff0000;');
    assert.equal(styles.serialize(styles.parse('  color:   RGB  (  1  ,  2  ,  3  )  ')), 'color: rgb  (  1  ,  2  ,  3  );');
    assert.equal(
      styles.serialize(styles.parse('   FONT-SIZE  :  10px  ;   COLOR  :  RGB  (  1  ,  2  ,  3  )   ')),
      'font-size: 10px; color: rgb  (  1  ,  2  ,  3  );'
    );
    assert.equal(styles.serialize(styles.parse('   FONT-SIZE  :  10px  ;   COLOR  :  RED   ')), 'font-size: 10px; color: red;');
  });

  it('Urls convert urls and force format', () => {
    const styles = Styles({
      url_converter: (url) => {
        return '|' + url + '|';
      }
    });

    assert.equal(styles.serialize(styles.parse('background: url(a)')), `background: url('|a|');`);
    assert.equal(styles.serialize(styles.parse('background: url("a")')), `background: url('|a|');`);
    assert.equal(styles.serialize(styles.parse(`background: url('a')`)), `background: url('|a|');`);
    assert.equal(styles.serialize(styles.parse('background: url(   a   )')), `background: url('|a|');`);
    assert.equal(styles.serialize(styles.parse('background: url(   "a"   )')), `background: url('|a|');`);
    assert.equal(styles.serialize(styles.parse(`background: url(    'a'    )`)), `background: url('|a|');`);
    assert.equal(
      styles.serialize(styles.parse(`background1: url(a); background2: url("a"); background3: url('a')`)),
      `background1: url('|a|'); background2: url('|a|'); background3: url('|a|');`
    );
    assert.equal(
      styles.serialize(styles.parse(`background: url('http://www.site.com/a?a=b&c=d')`)),
      `background: url('|http://www.site.com/a?a=b&c=d|');`
    );
    assert.equal(
      styles.serialize(styles.parse(`background: url('http://www.site.com/a_190x144.jpg');`)),
      `background: url('|http://www.site.com/a_190x144.jpg|');`
    );
  });

  it('Compress styles', () => {
    const styles = Styles();

    assert.equal(
      styles.serialize(
        styles.parse('border-top: 1px solid red; border-left: 1px solid red; border-bottom: 1px solid red; border-right: 1px solid red;')
      ),
      'border: 1px solid red;'
    );

    assert.equal(
      styles.serialize(
        styles.parse('border-width: 1pt 1pt 1pt 1pt; border-style: none none none none; border-color: black black black black;')
      ),
      'border: 1pt none black;'
    );

    assert.equal(
      styles.serialize(
        styles.parse('border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;')
      ),
      'border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;'
    );

    assert.equal(
      styles.serialize(
        styles.parse('border-top: 1px solid red; border-left: 1px solid red; border-right: 1px solid red; border-bottom: 1px solid red')
      ),
      'border: 1px solid red;'
    );

    assert.equal(
      styles.serialize(
        styles.parse('border-top: 1px solid red; border-right: 2px solid red; border-bottom: 3px solid red; border-left: 4px solid red')
      ),
      'border-top: 1px solid red; border-right: 2px solid red; border-bottom: 3px solid red; border-left: 4px solid red;'
    );

    assert.equal(
      styles.serialize(
        styles.parse('padding-top: 1px; padding-right: 2px; padding-bottom: 3px; padding-left: 4px')
      ),
      'padding: 1px 2px 3px 4px;'
    );

    assert.equal(
      styles.serialize(styles.parse('margin-top: 1px; margin-right: 2px; margin-bottom: 3px; margin-left: 4px')),
      'margin: 1px 2px 3px 4px;'
    );

    assert.equal(
      styles.serialize(styles.parse('margin-top: 1px; margin-right: 1px; margin-bottom: 1px; margin-left: 2px')),
      'margin: 1px 1px 1px 2px;'
    );

    assert.equal(
      styles.serialize(styles.parse('margin-top: 2px; margin-right: 1px; margin-bottom: 1px; margin-left: 1px')),
      'margin: 2px 1px 1px 1px;'
    );

    assert.equal(
      styles.serialize(
        styles.parse('border-top-color: red; border-right-color: green; border-bottom-color: blue; border-left-color: yellow')
      ),
      'border-color: red green blue yellow;'
    );

    assert.equal(
      styles.serialize(styles.parse('border-width: 1px; border-style: solid; border-color: red')),
      'border: 1px solid red;'
    );

    assert.equal(
      styles.serialize(styles.parse('border-width: 1px; border-color: red')),
      'border-width: 1px; border-color: red;'
    );
  });

  it('Font weight', () => {
    const styles = Styles();

    assert.equal(styles.serialize(styles.parse('font-weight: 700')), 'font-weight: bold;');
  });

  it('Valid styles', () => {
    const styles = Styles({}, Schema({ valid_styles: { '*': 'color,font-size', 'a': 'margin-left' }}));

    assert.equal(
      styles.serialize(styles.parse('color: #ff0000; font-size: 10px; margin-left: 10px; invalid: 1;'), 'b'),
      'color: #ff0000; font-size: 10px;'
    );
    assert.equal(
      styles.serialize(styles.parse('color: #ff0000; font-size: 10px; margin-left: 10px; invalid: 2;'), 'a'),
      'color: #ff0000; font-size: 10px; margin-left: 10px;'
    );
  });

  it('Invalid styles', () => {
    const styles = Styles({}, Schema({ invalid_styles: { '*': 'color,font-size', 'a': 'margin-left' }}));

    assert.equal(styles.serialize(styles.parse('color: #ff0000; font-size: 10px; margin-left: 10px'), 'b'), 'margin-left: 10px;');
    assert.equal(
      styles.serialize(styles.parse('color: #ff0000; font-size: 10px; margin-left: 10px; margin-right: 10px;'), 'a'),
      'margin-right: 10px;'
    );
  });

  it('Suspicious (XSS) property names', () => {
    const styles = Styles();

    assert.equal(styles.serialize(styles.parse(`font-fa"on-load\\3dxss\\28\\29\\20mily:'arial'`)), '');
    assert.equal(styles.serialize(styles.parse(`font-fa\\"on-load\\3dxss\\28\\29\\20mily:'arial'`)), '');
    assert.equal(styles.serialize(styles.parse(`font-fa\\22on-load\\3dxss\\28\\29\\20mily:'arial'`)), '');
  });

  it('Script urls denied', () => {
    const styles = Styles();

    assert.equal(styles.serialize(styles.parse('behavior:url(test.htc)')), '');
    assert.equal(styles.serialize(styles.parse('b\\65havior:url(test.htc)')), '');
    assert.equal(styles.serialize(styles.parse('color:expression(alert(1))')), '');
    assert.equal(styles.serialize(styles.parse('color:\\65xpression(alert(1))')), '');
    assert.equal(styles.serialize(styles.parse('color:exp/**/ression(alert(1))')), '');
    assert.equal(styles.serialize(styles.parse('color:/**/')), '');
    assert.equal(styles.serialize(styles.parse('color:  expression  (  alert(1))')), '');
    assert.equal(styles.serialize(styles.parse('background:url(jAvaScript:alert(1)')), '');
    assert.equal(styles.serialize(styles.parse('background:url(javascript:alert(1)')), '');
    assert.equal(styles.serialize(styles.parse('background:url(j\\61vascript:alert(1)')), '');
    assert.equal(styles.serialize(styles.parse('background:url(\\6a\\61vascript:alert(1)')), '');
    assert.equal(styles.serialize(styles.parse('background:url(\\6A\\61vascript:alert(1)')), '');
    assert.equal(styles.serialize(styles.parse('background:url\\28\\6A\\61vascript:alert(1)')), '');
    assert.equal(styles.serialize(styles.parse('background:\\75rl(j\\61vascript:alert(1)')), '');
    assert.equal(styles.serialize(styles.parse('b\\61ckground:\\75rl(j\\61vascript:alert(1)')), '');
    assert.equal(styles.serialize(styles.parse('background:url(vbscript:alert(1)')), '');
    assert.equal(styles.serialize(styles.parse('background:url(j\navas\u0000cr\tipt:alert(1)')), '');
    assert.equal(styles.serialize(styles.parse('background:url(data:image/svg+xml,%3Csvg/%3E)')), '');
    assert.equal(styles.serialize(styles.parse('background:url( data:image/svg+xml,%3Csvg/%3E)')), '');
    assert.equal(styles.serialize(styles.parse('background:url\\28 data:image/svg+xml,%3Csvg/%3E)')), '');
    assert.equal(styles.serialize(styles.parse('background:url("data: image/svg+xml,%3Csvg/%3E")')), '');
    assert.equal(styles.serialize(styles.parse('background:url("data: ima ge/svg+xml,%3Csvg/%3E")')), '');
    assert.equal(styles.serialize(styles.parse('background:url("data: image /svg+xml,%3Csvg/%3E")')), '');
  });

  it('Script urls allowed', () => {
    const styles = Styles({ allow_script_urls: true });

    assert.equal(styles.serialize(styles.parse('behavior:url(test.htc)')), `behavior: url('test.htc');`);
    assert.equal(styles.serialize(styles.parse('color:expression(alert(1))')), 'color: expression(alert(1));');
    assert.equal(styles.serialize(styles.parse('background:url(javascript:alert(1)')), `background: url('javascript:alert(1');`);
    assert.equal(styles.serialize(styles.parse('background:url(vbscript:alert(1)')), `background: url('vbscript:alert(1');`);
  });
});

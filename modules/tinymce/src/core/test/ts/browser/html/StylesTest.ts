import { Transformations } from '@ephox/acid';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Schema from 'tinymce/core/api/html/Schema';
import Styles from 'tinymce/core/api/html/Styles';

describe('browser.tinymce.core.html.StylesTest', () => {

  const assertStyles = (styles: Styles, input: string, expected: string) => {
    assert.equal(styles.serialize(styles.parse(input)), expected);
  };

  it('Basic parsing/serializing', () => {
    const styles = Styles();

    assertStyles(styles, 'FONT-SIZE:10px', 'font-size: 10px;');
    assertStyles(styles, 'FONT-SIZE:10px;COLOR:red', 'font-size: 10px; color: red;');
    assertStyles(styles, 'FONT-SIZE  :  10px  ;   COLOR  :  red   ', 'font-size: 10px; color: red;');
    assertStyles(styles, 'key:"value"', `key: 'value';`);
    assertStyles(styles, `key:"value1" 'value2'`, `key: 'value1' 'value2';`);
    assertStyles(styles, `key:"val\\"ue1" 'val\\'ue2'`, `key: 'val"ue1' 'val\\'ue2';`);
    assertStyles(styles, 'width:100%', 'width: 100%;');
    assertStyles(styles, 'value:_; value2:"_"', `value: _; value2: '_';`);
    assertStyles(styles, 'value: "&amp;"', `value: '&amp;';`);
    assertStyles(styles, 'value: "&"', `value: '&';`);
    assertStyles(styles, 'value: ', '');
    assertStyles(styles,
      `background: url('http://www.site.com/(foo)');`,
      `background: url('http://www.site.com/(foo)');`
    );
  });

  it('Colors force hex and lowercase', () => {
    const styles = Styles();

    assertStyles(styles, 'color: rgb(1,2,3)', 'color: rgb(1,2,3);');
    assertStyles(styles, 'color: RGB(1,2,3)', 'color: rgb(1,2,3);');
    assertStyles(styles, 'color: #FF0000', 'color: #ff0000;');
    assertStyles(styles, '  color:   RGB  (  1  ,  2  ,  3  )  ', 'color: rgb  (  1  ,  2  ,  3  );');
    assertStyles(styles,
      '   FONT-SIZE  :  10px  ;   COLOR  :  RGB  (  1  ,  2  ,  3  )   ',
      'font-size: 10px; color: rgb  (  1  ,  2  ,  3  );'
    );
    assertStyles(styles,
      '   FONT-SIZE  :  10px  ;   COLOR  :  RED   ',
      'font-size: 10px; color: red;'
    );
  });

  it('Urls convert urls and force format', () => {
    const styles = Styles({
      url_converter: (url) => {
        return '|' + url + '|';
      }
    });

    assertStyles(styles, 'background: url(a)', `background: url('|a|');`);
    assertStyles(styles, 'background: url("a")', `background: url('|a|');`);
    assertStyles(styles, `background: url('a')`, `background: url('|a|');`);
    assertStyles(styles, 'background: url(   a   )', `background: url('|a|');`);
    assertStyles(styles, 'background: url(   "a"   )', `background: url('|a|');`);
    assertStyles(styles, `background: url(    'a'    )`, `background: url('|a|');`);
    assertStyles(styles,
      `background1: url(a); background2: url("a"); background3: url('a')`,
      `background1: url('|a|'); background2: url('|a|'); background3: url('|a|');`
    );
    assertStyles(styles,
      `background: url('http://www.site.com/a?a=b&c=d')`,
      `background: url('|http://www.site.com/a?a=b&c=d|');`
    );
    assertStyles(styles,
      `background: url('http://www.site.com/a_190x144.jpg');`,
      `background: url('|http://www.site.com/a_190x144.jpg|');`
    );
  });

  it('Compress styles', () => {
    const styles = Styles();

    assertStyles(
      styles,
      'border-top: 1px solid red; border-left: 1px solid red; border-bottom: 1px solid red; border-right: 1px solid red;',
      'border: 1px solid red;'
    );

    assertStyles(
      styles,
      'border-width: 1pt 1pt 1pt 1pt; border-style: none none none none; border-color: black black black black;',
      'border: 1pt none black;'
    );

    assertStyles(
      styles,
      'border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;',
      'border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;'
    );

    assertStyles(
      styles,
      'border-top: 1px solid red; border-left: 1px solid red; border-right: 1px solid red; border-bottom: 1px solid red',
      'border: 1px solid red;'
    );

    assertStyles(
      styles,
      'border-top: 1px solid red; border-right: 2px solid red; border-bottom: 3px solid red; border-left: 4px solid red',
      'border-top: 1px solid red; border-right: 2px solid red; border-bottom: 3px solid red; border-left: 4px solid red;'
    );

    assertStyles(
      styles,
      'padding-top: 1px; padding-right: 2px; padding-bottom: 3px; padding-left: 4px',
      'padding: 1px 2px 3px 4px;'
    );

    assertStyles(
      styles,
      'margin-top: 1px; margin-right: 2px; margin-bottom: 3px; margin-left: 4px',
      'margin: 1px 2px 3px 4px;'
    );

    assertStyles(
      styles,
      'margin-top: 1px; margin-right: 1px; margin-bottom: 1px; margin-left: 2px',
      'margin: 1px 1px 1px 2px;'
    );

    assertStyles(
      styles,
      'margin-top: 2px; margin-right: 1px; margin-bottom: 1px; margin-left: 1px',
      'margin: 2px 1px 1px 1px;'
    );

    assertStyles(
      styles,
      'border-top-color: red; border-right-color: green; border-bottom-color: blue; border-left-color: yellow',
      'border-color: red green blue yellow;'
    );

    assertStyles(
      styles,
      'border-width: 1px; border-style: solid; border-color: red',
      'border: 1px solid red;'
    );

    assertStyles(
      styles,
      'border-width: 1px; border-color: red',
      'border-width: 1px; border-color: red;'
    );

    assertStyles(
      styles,
      'border-width: 1px; border-color: rgb(1, 2, 3)',
      'border-width: 1px; border-color: rgb(1, 2, 3);'
    );

    assertStyles(
      styles,
      'border-width: 1px; border-color: rgb(1, 2, 3); border-style: dashed',
      'border: 1px dashed rgb(1, 2, 3);'
    );
  });

  it('Font weight', () => {
    const styles = Styles();
    assertStyles(styles, 'font-weight: 700', 'font-weight: bold;');
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

    assertStyles(styles, `font-fa"on-load\\3dxss\\28\\29\\20mily:'arial'`, '');
    assertStyles(styles, `font-fa\\"on-load\\3dxss\\28\\29\\20mily:'arial'`, '');
    assertStyles(styles, `font-fa\\22on-load\\3dxss\\28\\29\\20mily:'arial'`, '');
  });

  it('Script urls denied', () => {
    const styles = Styles();

    assertStyles(styles, 'behavior:url(test.htc)', '');
    assertStyles(styles, 'b\\65havior:url(test.htc)', '');
    assertStyles(styles, 'color:expression(alert(1))', '');
    assertStyles(styles, 'color:\\65xpression(alert(1))', '');
    assertStyles(styles, 'color:exp/**/ression(alert(1))', '');
    assertStyles(styles, 'color:/**/', '');
    assertStyles(styles, 'color:  expression  (  alert(1))', '');
    assertStyles(styles, 'background:url(jAvaScript:alert(1)', '');
    assertStyles(styles, 'background:url(javascript:alert(1)', '');
    assertStyles(styles, 'background:url(j\\61vascript:alert(1)', '');
    assertStyles(styles, 'background:url(\\6a\\61vascript:alert(1)', '');
    assertStyles(styles, 'background:url(\\6A\\61vascript:alert(1)', '');
    assertStyles(styles, 'background:url\\28\\6A\\61vascript:alert(1)', '');
    assertStyles(styles, 'background:\\75rl(j\\61vascript:alert(1)', '');
    assertStyles(styles, 'b\\61ckground:\\75rl(j\\61vascript:alert(1)', '');
    assertStyles(styles, 'background:url(vbscript:alert(1)', '');
    assertStyles(styles, 'background:url(j\navas\u0000cr\tipt:alert(1)', '');
    assertStyles(styles, 'background:url(data:image/svg+xml,%3Csvg/%3E)', '');
    assertStyles(styles, 'background:url( data:image/svg+xml,%3Csvg/%3E)', '');
    assertStyles(styles, 'background:url\\28 data:image/svg+xml,%3Csvg/%3E)', '');
    assertStyles(styles, 'background:url("data: image/svg+xml,%3Csvg/%3E")', '');
    assertStyles(styles, 'background:url("data: ima ge/svg+xml,%3Csvg/%3E")', '');
    assertStyles(styles, 'background:url("data: image /svg+xml,%3Csvg/%3E")', '');
  });

  it('Script urls allowed', () => {
    const styles = Styles({ allow_script_urls: true });

    assertStyles(styles, 'behavior:url(test.htc)', `behavior: url('test.htc');`);
    assertStyles(styles, 'color:expression(alert(1))', 'color: expression(alert(1));');
    assertStyles(styles, 'background:url(javascript:alert(1)', `background: url('javascript:alert(1');`);
    assertStyles(styles, 'background:url(vbscript:alert(1)', `background: url('vbscript:alert(1');`);
  });

  const applyAndAssertForeColor = (editor: Editor, appliedColor: string, expectedColor: string) => {
    // Reset content
    editor.setContent('<p>colour me</p>');

    return {
      /** Apply color using 'mceApplyTextcolor' command. */
      usingCommand: () => {
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'color me'.length);
        editor.execCommand('mceApplyTextcolor', 'forecolor' as any, appliedColor);
        TinyAssertions.assertContentPresence(editor, { [`span[data-mce-style="color: ${expectedColor};"]`]: 1 });
      },
      /** Apply color using the 'forecolor' part of the toolbar. */
      usingToolbar: async () => {
        TinyUiActions.clickOnToolbar(editor, '[aria-label^="Text color"] > .tox-tbtn + .tox-split-button__chevron');
        await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
        TinyUiActions.clickOnUi(editor, `div[data-mce-color="${appliedColor}"]`);
        TinyAssertions.assertContentPresence(editor, { [`span[data-mce-style="color: ${expectedColor};"]`]: 1 });
      },
    };
  };

  context('force_hex_color option set to default ("off")', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
    }, []);

    it('TINY-9819: data-mce-style colors are left as RGB', () => {
      const editor = hook.editor();
      assert.equal(editor.options.get('force_hex_color'), 'off', 'force_hex_color must be set to "off"');
      applyAndAssertForeColor(editor, '#E03E2D', 'rgb(224, 62, 45)').usingCommand();
      applyAndAssertForeColor(editor, '#FF0000', 'rgb(255, 0, 0)').usingCommand();
      applyAndAssertForeColor(editor, '#00FF00', 'rgb(0, 255, 0)').usingCommand();
      applyAndAssertForeColor(editor, 'rgb(40, 120, 200)', 'rgb(40, 120, 200)').usingCommand();
    });

    it('TINY-9819: alpha channel is unaffected', () => {
      const editor = hook.editor();
      applyAndAssertForeColor(editor, 'rgba(224, 62, 45, 0.5)', 'rgba(224, 62, 45, 0.5)').usingCommand();
      applyAndAssertForeColor(editor, 'rgba(3, 2, 1, 0.01)', 'rgba(3, 2, 1, 0.01)').usingCommand();
    });
  });

  context('force_hex_color option set to "rgb_only"', () => {
    const color_map = [ '#E03E2D', 'Red', 'rgb(10, 200, 10)', 'Green' ];
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      force_hex_color: 'rgb_only',
      toolbar: 'forecolor',
      color_map,
    }, []);

    it('TINY-9819: will leave RGBA colors unaffected', () => {
      const editor = hook.editor();
      assert.equal(editor.options.get('force_hex_color'), 'rgb_only', 'force_hex_color must be set to "rgb_only"');
      applyAndAssertForeColor(editor, 'rgba(50, 60, 70, 0.4)', 'rgba(50, 60, 70, 0.4)').usingCommand();
    });

    it('TINY-9819: will convert RGB to HEX', () => {
      applyAndAssertForeColor(hook.editor(), 'rgb(50, 60, 70)', '#323C46').usingCommand();
      applyAndAssertForeColor(hook.editor(), 'rgb(105, 72, 72)', '#694848').usingCommand();
    });

    it('TINY-9819: will convert RGB to HEX with toolbar & color_map', async () => {
      const editor = hook.editor();
      await applyAndAssertForeColor(editor, color_map[0], color_map[0]).usingToolbar();
      const hex = Transformations.rgbaToHexString(color_map[2]);
      await applyAndAssertForeColor(editor, hex, hex).usingToolbar();
    });
  });

  context('force_hex_color option set to "always"', () => {
    const color_map = [ '#E03E2D', 'Red', 'rgb(10, 200, 10)', 'Green', 'rgba(10, 10, 200, 0.9)', 'Blue' ];
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      force_hex_color: 'always',
      toolbar: 'forecolor',
      color_map,
    }, []);

    it('TINY-9819: will convert RGB & RGBA to HEX', () => {
      const editor = hook.editor();
      assert.equal(editor.options.get('force_hex_color'), 'always', 'force_hex_color must be set to "always"');
      applyAndAssertForeColor(editor, 'rgb(50, 60, 70)', '#323C46').usingCommand();
      applyAndAssertForeColor(editor, 'rgba(50, 60, 70, 0.4)', '#323C46').usingCommand();
    });

    it('TINY-9819: will convert RGB & RGBA to HEX with toolbar & color_map', async () => {
      const editor = hook.editor();
      await applyAndAssertForeColor(editor, color_map[0], color_map[0]).usingToolbar();
      let hex = Transformations.rgbaToHexString(color_map[2]);
      await applyAndAssertForeColor(editor, hex, hex).usingToolbar();
      hex = Transformations.rgbaToHexString(color_map[4]);
      await applyAndAssertForeColor(editor, hex, hex).usingToolbar();
    });
  });

  context('force_hex_color option set to "always" and without color_map', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      force_hex_color: 'always',
      toolbar: 'forecolor',
    }, []);

    it('TINY-9819: will convert RGB & RGBA to HEX', () => {
      const editor = hook.editor();
      assert.isFalse(editor.options.isSet('color_map'));

      applyAndAssertForeColor(editor, '#00FF00', '#00FF00').usingCommand();
      applyAndAssertForeColor(editor, 'rgb(10, 200, 10)', '#0AC80A').usingCommand();
      applyAndAssertForeColor(editor, 'rgba(10, 10, 200, 0.9)', '#0A0AC8').usingCommand();
    });

    it('TINY-9819: will convert RGB & RGBA to HEX with toolbar & without color_map', async () => {
      const editor = hook.editor();
      await applyAndAssertForeColor(editor, '#BA372A', '#BA372A').usingToolbar();
      await applyAndAssertForeColor(editor, '#3598DB', '#3598DB').usingToolbar();
      await applyAndAssertForeColor(editor, '#B96AD9', '#B96AD9').usingToolbar();
    });
  });
});

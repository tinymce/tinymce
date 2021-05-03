import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.FormatterCheckTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    extended_valid_elements: 'b,i,span[style|class|contenteditable]',
    entities: 'raw',
    convert_fonts_to_spans: false,
    forced_root_block: false,
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,' +
        'margin,margin-top,margin-right,margin-bottom,margin-left,display,text-align'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  it('Selected style element text', () => {
    const editor = hook.editor();
    editor.focus();
    editor.formatter.register('bold', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b>1234</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('b')[0].firstChild, 4);
    editor.selection.setRng(rng);
    assert.isTrue(editor.formatter.match('bold'), 'Selected style element text');
  });

  it('Selected style element with css styles', () => {
    const editor = hook.editor();
    editor.formatter.register('color', { inline: 'span', styles: { color: '#ff0000' }});
    editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
    editor.selection.setRng(rng);
    assert.isTrue(editor.formatter.match('color'), 'Selected style element with css styles');
  });

  it('Selected style element with css styles indexed', () => {
    const editor = hook.editor();
    editor.formatter.register('color', { inline: 'span', styles: [ 'color' ] });
    editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
    editor.selection.setRng(rng);
    assert.isTrue(editor.formatter.match('color'), 'Selected style element with css styles');
  });

  it('Selected style element with attributes', () => {
    const editor = hook.editor();
    editor.formatter.register('fontsize', { inline: 'font', attributes: { size: '7' }});
    editor.getBody().innerHTML = '<p><font size="7">1234</font></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('font')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('font')[0].firstChild, 4);
    editor.selection.setRng(rng);
    assert.isTrue(editor.formatter.match('fontsize'), 'Selected style element with attributes');
  });

  it('Selected style element text multiple formats', () => {
    const editor = hook.editor();
    editor.formatter.register('multiple', [
      { inline: 'b' },
      { inline: 'strong' }
    ]);
    editor.getBody().innerHTML = '<p><strong>1234</strong></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('strong')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('strong')[0].firstChild, 4);
    editor.selection.setRng(rng);
    assert.isTrue(editor.formatter.match('multiple'), 'Selected style element text multiple formats');
  });

  it('Selected complex style element', () => {
    const editor = hook.editor();
    editor.formatter.register('complex', { inline: 'span', styles: { fontWeight: 'bold' }});
    editor.getBody().innerHTML = '<p><span style="color:#ff0000; font-weight:bold">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
    editor.selection.setRng(rng);
    assert.isTrue(editor.formatter.match('complex'), 'Selected complex style element');
  });

  it('Selected non style element text', () => {
    const editor = hook.editor();
    editor.formatter.register('bold', { inline: 'b' });
    editor.getBody().innerHTML = '<p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
    editor.selection.setRng(rng);
    assert.isFalse(editor.formatter.match('bold'), 'Selected non style element text');
  });

  it('Selected partial style element (start)', () => {
    const editor = hook.editor();
    editor.formatter.register('bold', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b>1234</b>5678</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('p')[0].lastChild, 4);
    editor.selection.setRng(rng);
    assert.isTrue(editor.formatter.match('bold'), 'Selected partial style element (start)');
  });

  it('Selected partial style element (end)', () => {
    const editor = hook.editor();
    editor.formatter.register('bold', { inline: 'b' });
    editor.getBody().innerHTML = '<p>1234<b>5678</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('b')[0].lastChild, 4);
    editor.selection.setRng(rng);
    assert.isFalse(editor.formatter.match('bold'), 'Selected partial style element (end)');
  });

  it('Selected element text with parent inline element', () => {
    const editor = hook.editor();
    editor.formatter.register('bold', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b><em><span>1234</span></em></b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
    editor.selection.setRng(rng);
    assert.isTrue(editor.formatter.match('bold'), 'Selected element text with parent inline element');
  });

  it('Selected element match with variable', () => {
    const editor = hook.editor();
    editor.formatter.register('complex', { inline: 'span', styles: { color: '%color' }});
    editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
    editor.selection.setRng(rng);
    assert.isTrue(editor.formatter.match('complex', { color: '#ff0000' }), 'Selected element match with variable');
  });

  it('Selected element match with variable and function', () => {
    const editor = hook.editor();
    editor.formatter.register('complex', {
      inline: 'span',
      styles: {
        color: (vars) => {
          return vars.color + '00';
        }
      }
    });

    editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
    editor.selection.setRng(rng);
    assert.isTrue(editor.formatter.match('complex', { color: '#ff00' }), 'Selected element match with variable and function');
  });

  it('matchAll', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><b><i>a</i></b></p>';
    LegacyUnit.setSelection(editor, 'i', 0, 'i', 1);
    assert.sameMembers(editor.formatter.matchAll([ 'bold', 'italic', 'underline' ]), [ 'italic', 'bold' ]);
  });

  it('canApply', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a</p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    assert.isTrue(editor.formatter.canApply('bold'));
  });

  it('Custom onmatch handler', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      onmatch: (elm) => {
        return elm.className === 'x';
      }
    });

    editor.setContent('<p><span class="a">a</span><span class="x">b</span></p>');
    LegacyUnit.setSelection(editor, 'span:nth-child(1)', 0, 'span:nth-child(1)', 0);
    assert.isFalse(editor.formatter.match('format'), 'Should not match since the onmatch matches on x classes.');
    LegacyUnit.setSelection(editor, 'span:nth-child(2)', 0, 'span:nth-child(2)', 0);
    assert.isTrue(editor.formatter.match('format'), 'Should match since the onmatch matches on x classes.');
  });

  it('formatChanged complex format', () => {
    const editor = hook.editor();
    let newState, newArgs;

    editor.formatter.register('complex', { inline: 'span', styles: { color: '%color' }});

    const handler = editor.formatter.formatChanged('complex', (state, args) => {
      newState = state;
      newArgs = args;
    }, true);

    editor.getBody().innerHTML = '<p>text</p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);

    // Check apply
    editor.formatter.apply('complex', { color: '#FF0000' });
    editor.nodeChanged();
    assert.isTrue(newState);
    assert.equal(newArgs.format, 'complex');
    LegacyUnit.equalDom(newArgs.node, editor.getBody().firstChild.firstChild);
    assert.lengthOf(newArgs.parents, 2);

    // Check remove
    editor.formatter.remove('complex', { color: '#FF0000' });
    editor.nodeChanged();
    assert.isFalse(newState);
    assert.equal(newArgs.format, 'complex');
    LegacyUnit.equalDom(newArgs.node, editor.getBody().firstChild);
    assert.lengthOf(newArgs.parents, 1);

    // Unbind the format change handler
    handler.unbind();
  });

  it('Match on link format', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML =
      '<p><a href="http://www.test.com">http://www.test.com</a></p>' +
      '<p>Normal text</p>' +
      '<p><a>Bare Anchor</a></p>' +
      '<p><a id="abc"></a></p>';
    const rng = editor.dom.createRng();

    // Check link format matches on link
    rng.setStart(editor.dom.select('a')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('a')[0].firstChild, 1);
    editor.selection.setRng(rng);
    assert.isTrue(editor.formatter.match('link'), 'Match on link format');

    // Check link format does not match on normal text
    rng.setStart(editor.dom.select('p')[1].firstChild, 0);
    rng.setEnd(editor.dom.select('p')[1].firstChild, 4);
    editor.selection.setRng(rng);
    assert.isFalse(editor.formatter.match('link'), 'No match on normal text');

    // Check link format does not match on bare anchor
    rng.setStart(editor.dom.select('a')[1].firstChild, 2);
    rng.setStart(editor.dom.select('a')[1].firstChild, 2);
    editor.selection.setRng(rng);
    assert.isFalse(editor.formatter.match('link'), 'No match on bare anchor');

    // Check link format does not match on named anchor
    rng.setStart(editor.dom.select('a')[2], 0);
    rng.setEnd(editor.dom.select('a')[2], 0);
    editor.selection.setRng(rng);
    assert.isFalse(editor.formatter.match('link'), 'No match on named anchor');
  });

  it('TINY-7227: match one class on an element with multiple classes', () => {
    const editor = hook.editor();
    editor.formatter.register('formatA', { selector: 'p', classes: [ '%value' ] });

    editor.setContent('<p class="a b c">test</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 0);

    assert.isTrue(editor.formatter.match('formatA', { value: 'b' }), 'Should match since the onmatch matches on "b" class.');
  });

  it('TINY-7227: match multiple values on an element with multiple classes', () => {
    const editor = hook.editor();
    editor.formatter.register('formatA', { selector: 'p', classes: [ '%value' ] });

    editor.setContent('<p class="a b c">test</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 0);

    assert.isTrue(editor.formatter.match('formatA', { value: 'a' }), 'Should match since the onmatch matches on "a" value.');
    assert.isTrue(editor.formatter.match('formatA', { value: 'b' }), 'Should match since the onmatch matches on "b" value.');
    assert.isTrue(editor.formatter.match('formatA', { value: 'c' }), 'Should match since the onmatch matches on "c" value.');
    assert.isFalse(editor.formatter.match('formatA', { value: 'd' }), 'Should not match since the "d" class does not exist.');
  });

  it('TINY-7227: match whole value with spaces', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { selector: 'p', classes: [ '%value' ] });

    editor.setContent('<p class="format plus">test</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 0);

    assert.isTrue(editor.formatter.match('format', { value: 'format plus' }), 'Should match since the onmatch matches on "format plus" value.');
  });
});

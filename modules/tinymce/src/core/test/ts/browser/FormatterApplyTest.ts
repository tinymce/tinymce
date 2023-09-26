import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { Hierarchy } from '@ephox/sugar';
import { LegacyUnit, TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import * as KeyUtils from '../module/test/KeyUtils';

describe('browser.tinymce.core.FormatterApplyTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    extended_valid_elements: 'b[id|style|title],i[id|style|title],span[id|class|style|title|contenteditable],font[face|size]',
    entities: 'raw',
    convert_fonts_to_spans: false,
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,' +
        'margin,margin-top,margin-right,margin-bottom,margin-left,display,text-align'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const getContent = (editor: Editor) => {
    return editor.getContent().toLowerCase().replace(/[\r]+/g, '');
  };

  it('apply inline to a list', () => {
    const editor = hook.editor();
    editor.focus();
    editor.formatter.register('format', {
      inline: 'b',
      toggle: false
    });
    editor.getBody().innerHTML = '<p>1234</p><ul><li>first element</li><li>second element</li></ul><p>5678</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[1].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p><b>1234</b></p><ul><li><b>first element</b></li><li><b>second element</b></li></ul><p><b>5678</b></p>',
      'selection of a list'
    );
  });

  it('Toggle OFF - Inline element on selected text', () => {
    const editor = hook.editor();
    // Toggle OFF - Inline element on selected text
    editor.formatter.register('format', {
      inline: 'b',
      toggle: false
    });
    editor.getBody().innerHTML = '<p><b>1234</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('b')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.toggle('format');
    assert.equal(getContent(editor), '<p><b>1234</b></p>');
  });

  it('Toggle OFF - Inline element on partially selected text', () => {
    const editor = hook.editor();
    // Toggle OFF - Inline element on partially selected text
    editor.formatter.register('format', {
      inline: 'b',
      toggle: false
    });
    editor.getBody().innerHTML = '<p>1<b>23</b>4</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('b')[0].firstChild as Text, 2);
    editor.selection.setRng(rng);
    editor.formatter.toggle('format');
    assert.equal(getContent(editor), '<p>1<b>23</b>4</p>');
  });

  it('Toggle OFF - Inline element on partially selected text in start/end elements', () => {
    const editor = hook.editor();
    // Toggle OFF - Inline element on partially selected text in start/end elements
    editor.formatter.register('format', {
      inline: 'b',
      toggle: false
    });
    editor.getBody().innerHTML = '<p>1<b>234</b></p><p><b>123</b>4</p>'; // '<p>1234</p><p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('b')[1].firstChild as Text, 3);
    editor.selection.setRng(rng);
    editor.formatter.toggle('format');
    assert.equal(getContent(editor), '<p>1<b>234</b></p><p><b>123</b>4</p>');
  });

  it('Toggle OFF - Inline element with data attribute', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b data-mce-x="1">1</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('b')[0].firstChild as Text, 1);
    editor.selection.setRng(rng);
    editor.formatter.toggle('format');
    assert.equal(getContent(editor), '<p>1</p>');
  });

  it('Toggle ON - NO inline element on selected text', () => {
    const editor = hook.editor();
    // Inline element on selected text
    editor.formatter.register('format', {
      inline: 'b',
      toggle: true
    });
    editor.getBody().innerHTML = '<p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>1234</b></p>', 'Inline element on selected text');
    editor.formatter.toggle('format');
    assert.equal(getContent(editor), '<p>1234</p>', 'Toggle ON - NO inline element on selected text');
  });

  it('Selection spanning from within format to outside format with toggle off', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b',
      toggle: false
    });
    editor.getBody().innerHTML = '<p><b>12</b>34</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].lastChild as Text, 2);
    editor.selection.setRng(rng);
    editor.formatter.toggle('format');
    assert.equal(getContent(editor), '<p><b>1234</b></p>', 'Extend formating if start of selection is already formatted');
  });

  it('Inline element on partially selected text', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 3);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p>1<b>23</b>4</p>', 'Inline element on partially selected text');
    editor.formatter.toggle('format');
    assert.equal(getContent(editor), '<p>1234</p>', 'Toggle ON - NO inline element on partially selected text');
  });

  it('Inline element on partially selected text in start/end elements', () => {
    const editor = hook.editor();
    // Inline element on partially selected text in start/end elements
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p>1234</p><p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('p')[1].firstChild as Text, 3);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p>1<b>234</b></p><p><b>123</b>4</p>');
  });

  it('Inline element on selected element', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>1234</b></p>', 'Inline element on selected element');
  });

  it('Inline element on multiple selected elements', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p>1234</p><p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 2);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>1234</b></p><p><b>1234</b></p>', 'Inline element on multiple selected elements');
  });

  it('Inline element on multiple selected elements with various childnodes', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p><em>1234</em>5678<span>9</span></p><p><em>1234</em>5678<span>9</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 2);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p><b><em>1234</em>5678<span>9</span></b></p><p><b><em>1234</em>5678<span>9</span></b></p>',
      'Inline element on multiple selected elements with various childnodes'
    );
  });

  it('Inline element with attributes', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b',
      attributes: {
        title: 'value1',
        id: 'value2'
      }
    });
    editor.getBody().innerHTML = '<p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b id="value2" title="value1">1234</b></p>', 'Inline element with attributes');
  });

  it('Inline element with styles', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b',
      styles: {
        color: '#ff0000',
        fontSize: '10px'
      }
    });
    editor.getBody().innerHTML = '<p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b style="color: rgb(255, 0, 0); font-size: 10px;">1234</b></p>', 'Inline element with styles');
  });

  it('Inline element with attributes and styles', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b',
      attributes: {
        title: 'value1',
        id: 'value2'
      },
      styles: {
        color: '#ff0000',
        fontSize: '10px'
      }
    });
    editor.getBody().innerHTML = '<p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p><b id="value2" style="color: rgb(255, 0, 0); font-size: 10px;" title="value1">1234</b></p>',
      'Inline element with attributes and styles'
    );
  });

  it('Inline element with wrapable parents', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p>x<em><span>1234</span></em>y</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('span')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p>x<b><em><span>1234</span></em></b>y</p>', 'Inline element with wrapable parents');
  });

  it('Inline element with redundant child', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p><b>1234</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('p')[0], 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>1234</b></p>', 'Inline element with redundant child');
  });

  it('Inline element with redundant parent', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p><b>a<em>1234</em>b</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('em')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>a<em>1234</em>b</b></p>', 'Inline element with redundant parent');
  });

  it('Inline element with redundant child of similar type 1', () => {
    const editor = hook.editor();
    editor.formatter.register('format', [{
      inline: 'b'
    }, {
      inline: 'strong'
    }]);
    editor.getBody().innerHTML = '<p>a<strong>1234</strong>b</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('p')[0], 3);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>a1234b</b></p>', 'Inline element with redundant child of similar type 1');
  });

  it('Inline element with redundant child of similar type 2', () => {
    const editor = hook.editor();
    editor.formatter.register('format', [{
      inline: 'b'
    }, {
      inline: 'span',
      styles: {
        fontWeight: 'bold'
      }
    }]);
    editor.getBody().innerHTML = '<p><span style="font-weight:bold">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('p')[0], 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>1234</b></p>', 'Inline element with redundant child of similar type 2');
  });

  it('Inline element with redundant children of similar types', () => {
    const editor = hook.editor();
    editor.formatter.register('format', [{
      inline: 'b'
    }, {
      inline: 'strong'
    }, {
      inline: 'span',
      styles: {
        fontWeight: 'bold'
      }
    }]);
    editor.getBody().innerHTML = '<p><span style="font-weight:bold">a<strong>1234</strong><b>5678</b>b</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('p')[0], 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>a12345678b</b></p>', 'Inline element with redundant children of similar types');
  });

  it('Inline element with redundant parent 1', () => {
    const editor = hook.editor();
    editor.formatter.register('format', [{
      inline: 'b'
    }, {
      inline: 'strong'
    }]);
    editor.getBody().innerHTML = '<p><strong>a<em>1234</em>b</strong></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('em')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><strong>a<em>1234</em>b</strong></p>', 'Inline element with redundant parent 1');
  });

  it('Inline element with redundant parent 2', () => {
    const editor = hook.editor();
    editor.formatter.register('format', [{
      inline: 'b'
    }, {
      inline: 'span',
      styles: {
        fontWeight: 'bold'
      }
    }]);
    editor.getBody().innerHTML = '<p><span style="font-weight:bold">a<em>1234</em>b</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('em')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><span style="font-weight: bold;">a<em>1234</em>b</span></p>', 'Inline element with redundant parent 2');
  });

  it('Inline element with redundant parents of similar types', () => {
    const editor = hook.editor();
    editor.formatter.register('format', [{
      inline: 'b'
    }, {
      inline: 'strong'
    }, {
      inline: 'span',
      styles: {
        fontWeight: 'bold'
      }
    }]);
    editor.getBody().innerHTML = '<p><span style="font-weight:bold"><strong><b>a<em>1234</em>b</b></strong></span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('em')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p><span style="font-weight: bold;"><strong><b>a<em>1234</em>b</b></strong></span></p>',
      'Inline element with redundant parents of similar types'
    );
  });

  it('Inline element merged with parent and child', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p>a<b>12<b>34</b>56</b>b</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('b')[0].lastChild as Text, 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p>a<b>123456</b>b</p>', 'Inline element merged with parent and child');
  });

  it('Inline element merged with child 1', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        fontWeight: 'bold'
      }
    });
    editor.getBody().innerHTML = '<p>a<span style="font-weight:bold">1234</span>b</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><span style="font-weight: bold;">a1234b</span></p>', 'Inline element merged with child 1');
  });

  it('Inline element merged with child 2', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        fontWeight: 'bold'
      }
    });
    editor.getBody().innerHTML = '<p>a<span style="font-weight:bold; color:#ff0000">1234</span>b</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p><span style="font-weight: bold;">a<span style="color: rgb(255, 0, 0);">1234</span>b</span></p>',
      'Inline element merged with child 2'
    );
  });

  it('Inline element merged with child 3', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        fontWeight: 'bold'
      }
    });
    editor.getBody().innerHTML = '<p>a<span id="test-id" style="font-weight:bold">1234</span>b</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p><span style=\"font-weight: bold;\">a<span id=\"test-id\">1234</span>b</span></p>',
      'Inline element merged with child 3'
    );
  });

  it('Inline element merged with child 4', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        fontWeight: 'bold'
      }
    });
    editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><span style="color: rgb(255, 0, 0); font-weight: bold;">1234</span></p>');
  });

  it('Inline element merged with child 5', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        color: '#00ff00'
      }
    });
    editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><span style="color: rgb(0, 255, 0);">1234</span></p>', 'Inline element merged with child 5');
  });

  it('Inline element with attributes merged with child 1', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'font',
      attributes: {
        face: 'arial'
      }
    });
    editor.getBody().innerHTML = '<p><font size="7">1234</font></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><font face="arial" size="7">1234</font></p>', 'Inline element with attributes merged with child 1');
  });

  it('Inline element with attributes merged with child 2', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'font',
      attributes: {
        size: '7'
      }
    });
    editor.getBody().innerHTML = '<p>a<font size="7">1234</font>b</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><font size="7">a1234b</font></p>', 'Inline element with attributes merged with child 2');
  });

  it('Inline element merged with left sibling', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p><b>1234</b>5678</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].lastChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].lastChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>12345678</b></p>', 'Inline element merged with left sibling');
  });

  it('Inline element merged with right sibling', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p>1234<b>5678</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>12345678</b></p>', 'Inline element merged with right sibling');
  });

  it('Inline element merged with left and right siblings', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p><b>12</b>34<b>56</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].childNodes[1], 0);
    rng.setEnd(editor.dom.select('p')[0].childNodes[1], 2);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>123456</b></p>', 'Inline element merged with left and right siblings');
  });

  it('Inline element merged with data attributed left sibling', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p><b data-mce-x="1">1234</b>5678</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].lastChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].lastChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b data-mce-x="1">12345678</b></p>', 'Inline element merged with left sibling');
  });

  it(`Don't merge siblings with whitespace between 1`, () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p><b>a</b> b</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].lastChild as Text, 1);
    rng.setEnd(editor.dom.select('p')[0].lastChild as Text, 2);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>a</b> <b>b</b></p>', `Don't merge siblings with whitespace between 1`);
  });

  it(`Don't merge siblings with whitespace between 2`, () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p>a <b>b</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>a</b> <b>b</b></p>', `Don't merge siblings with whitespace between 2`);
  });

  it('Inline element not merged in exact mode', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        color: '#00ff00'
      },
      exact: true
    });
    editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p><span style="color: rgb(0, 255, 0);"><span style="color: #ff0000;">1234</span></span></p>',
      'Inline element not merged in exact mode'
    );
  });

  it('Inline element merged in exact mode', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        color: '#ff0000'
      },
      exact: true
    });
    editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><span style="color: rgb(255, 0, 0);">1234</span></p>');
  });

  it('Deep left branch', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p><em><i><ins>1234</ins></i></em><em>text1</em><em>text2</em></p><p><em>5678</em></p><p>9012</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('ins')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('p')[2].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p><em><i><ins>1<b>234</b></ins></i></em><b><em>text1</em><em>text2</em></b></p><p><b><em>5678</em></b></p><p><b>9012</b></p>',
      'Deep left branch'
    );
  });

  it('Deep right branch', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p>9012</p><p><em>5678</em></p><p><em><i><ins>1234</ins></i></em><em>text1</em><em>text2</em></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('em')[3].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p><b>9012</b></p><p><b><em>5678</em></b></p><p><b><em><i><ins>1234</ins></i></em><em>text1</em></b><em><b>text</b>2</em></p>',
      'Deep right branch'
    );
  });

  it('Full element text selection on two elements with a table in the middle', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.getBody().innerHTML = '<p>1234</p><table><tbody><tr><td>123</td></tr></tbody></table><p>5678</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[1].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p><b>1234</b></p><table><tbody><tr><td><b>123</b></td></tr></tbody></table><p><b>5678</b></p>',
      'Full element text selection on two elements with a table in the middle'
    );
  });

  it('Inline element on selected text with variables', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b',
      styles: {
        color: '%color'
      },
      attributes: {
        title: '%title'
      }
    });
    editor.getBody().innerHTML = '<p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format', {
      color: '#ff0000',
      title: 'title'
    });
    assert.equal(getContent(editor), '<p><b style="color: rgb(255, 0, 0);" title="title">1234</b></p>', 'Inline element on selected text');
  });

  it('Remove redundant children', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        fontFamily: 'arial'
      }
    });
    editor.getBody().innerHTML = (
      '<p><span style="font-family: sans-serif;"><span style="font-family: palatino;">1</span>2<span style="font-family: verdana;">3</span>4</span></p>'
    );
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('p')[0], 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><span style=\"font-family: arial;\">1234</span></p>', 'Remove redundant children');
  });

  it('Inline element on selected text with function values', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b',
      styles: {
        color: (vars) => {
          return vars?.color + '00ff';
        }
      },
      attributes: {
        title: (vars) => {
          return vars?.title + '2';
        }
      }
    });
    editor.getBody().innerHTML = '<p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format', {
      color: '#ff',
      title: 'title'
    });
    assert.equal(getContent(editor), '<p><b style="color: rgb(255, 0, 255);" title="title2">1234</b></p>', 'Inline element on selected text with function values');
  });

  it('Block element on selected text', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      block: 'div'
    });
    editor.getBody().innerHTML = '<p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<div>1234</div>', 'Block element on selected text');
  });

  it('Block element on partially selected text', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      block: 'div'
    });
    editor.getBody().innerHTML = '<p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 3);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<div>1234</div>', 'Block element on partially selected text');
  });

  it('Block element on selected element', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      block: 'div'
    });
    editor.getBody().innerHTML = '<p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<div>1234</div>', 'Block element on selected element');
  });

  it('Block element on selected elements', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      block: 'div'
    });
    editor.getBody().innerHTML = '<p>1234</p><p>5678</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 2);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<div>1234</div><div>5678</div>', 'Block element on selected elements');
  });

  it('Block element on selected elements with attributes', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      block: 'div',
      attributes: {
        title: 'test'
      }
    });
    editor.getBody().innerHTML = '<p>1234</p><p>5678</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 2);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<div title="test">1234</div><div title="test">5678</div>', 'Block element on selected elements with attributes');
  });

  it('Block element on nested element', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      block: 'p'
    });
    editor.getBody().innerHTML = '<div><h1>1234</h1></div>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('h1')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('h1')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<div><p>1234</p></div>', 'Block element on nested element');
  });

  it('Block element on selected non wrapped text 1', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      block: 'div'
    });
    editor.getBody().innerHTML = '1234';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild as Text, 0);
    rng.setEnd(editor.getBody().firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<div>1234</div>', 'Block element on selected non wrapped text 1');
  });

  it('Block element on selected non wrapped text 2', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      block: 'div'
    });
    editor.getBody().innerHTML = '1234<br />4567<br />8910';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild as Text, 0);
    rng.setEnd(editor.getBody().lastChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<div>1234</div><div>4567</div><div>8910</div>', 'Block element on selected non wrapped text 2');
  });

  it('Block element on selected non wrapped text 3', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      block: 'div'
    });
    editor.getBody().innerHTML = '<br />1234<br /><br />4567<br />8910<br />';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 7);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<div>1234</div><div>4567</div><div>8910</div>', 'Block element on selected non wrapped text 3');
  });

  it('Block element wrapper 1', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      block: 'blockquote',
      wrapper: true
    });
    editor.getBody().innerHTML = '<h1>1234</h1><p>5678</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('h1')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<blockquote><h1>1234</h1><p>5678</p></blockquote>', 'Block element wrapper 1');
  });

  it('Block element wrapper 2', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      block: 'blockquote',
      wrapper: true
    });
    editor.getBody().innerHTML = '<h1>1234</h1>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('h1')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('h1')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<blockquote><h1>1234</h1></blockquote>', 'Block element wrapper 2');
  });

  it('Block element wrapper 3', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      block: 'blockquote',
      wrapper: true
    });
    editor.getBody().innerHTML = '<br /><h1>1234</h1><br />';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 3);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<blockquote><h1>1234</h1></blockquote>', 'Block element wrapper 3');
  });

  it('Apply format on single element that matches a selector 1', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      selector: 'p',
      attributes: {
        title: 'test'
      },
      styles: {
        color: '#ff0000'
      },
      classes: 'a b c'
    });
    editor.getBody().innerHTML = '<p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p class="a b c" style="color: rgb(255, 0, 0);" title="test">1234</p>',
      'Apply format on single element that matches a selector'
    );
  });

  it('Apply format on single element parent that matches a selector 2', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      selector: 'div',
      attributes: {
        title: 'test'
      },
      styles: {
        color: '#ff0000'
      },
      classes: 'a b c'
    });
    editor.getBody().innerHTML = '<div><p>1234</p><p>test</p><p>1234</p></div>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('div')[0], 1);
    rng.setEnd(editor.dom.select('div')[0], 2);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<div class="a b c" style="color: rgb(255, 0, 0);" title="test"><p>1234</p><p>test</p><p>1234</p></div>',
      'Apply format on single element parent that matches a selector'
    );
  });

  it('Apply format on multiple elements that matches a selector 2', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      selector: 'p',
      attributes: {
        title: 'test'
      },
      styles: {
        color: '#ff0000'
      },
      classes: 'a b c'
    });
    editor.getBody().innerHTML = '<p>1234</p><div>test</div><p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[1].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p class="a b c" style="color: rgb(255, 0, 0);" title="test">1234</p><div>test</div><p class="a b c" style="color: rgb(255, 0, 0);" title="test">1234</p>',
      'Apply format on multiple elements that matches a selector'
    );
  });

  it('Apply format on top of existing selector element', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      selector: 'p',
      attributes: {
        title: 'test2'
      },
      styles: {
        color: '#00ff00'
      },
      classes: 'a b c'
    });
    editor.getBody().innerHTML = '<p class=\"c d\" title=\"test\">1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p class="c d a b" style="color: rgb(0, 255, 0);" title="test2">1234</p>',
      'Apply format on top of existing selector element'
    );
  });

  it('Format on single li that matches a selector', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      selector: 'li',
      attributes: {
        title: 'test'
      },
      styles: {
        color: '#ff0000'
      },
      classes: 'a b c'
    });
    editor.getBody().innerHTML = '<div>text</div>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('div')[0], 0);
    rng.setEnd(editor.dom.select('div')[0], 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<div><span class="a b c" style="color: rgb(255, 0, 0);" title="test">text</span></div>',
      'Apply format on single element that matches a selector'
    );
  });

  it('Format on single div that matches a selector', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      selector: 'div',
      attributes: {
        title: 'test'
      },
      styles: {
        color: '#ff0000'
      },
      classes: 'a b c'
    });
    editor.getBody().innerHTML = '<div>text</div>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('div')[0], 0);
    rng.setEnd(editor.dom.select('div')[0], 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<div class="a b c" style="color: rgb(255, 0, 0);" title="test">text</div>',
      'Apply format on single element that matches a selector'
    );
  });

  it('Bold and italics is applied to text that is not highlighted', () => {
    const editor = hook.editor();
    const rng = editor.dom.createRng();
    editor.setContent('<p><span style="font-family: Arial;"><strong>test1 test2</strong> test3 test4 test5 test6</span></p>');
    rng.setStart(editor.dom.select('strong')[0].firstChild as Text, 6);
    rng.setEnd(editor.dom.select('strong')[0].firstChild as Text, 11);
    editor.focus();
    editor.selection.setRng(rng);
    editor.execCommand('Italic');
    assert.equal(
      editor.getContent(),
      '<p><span style="font-family: Arial;"><strong>test1 <em>test2</em></strong> test3 test4 test5 test6</span></p>',
      'Selected text should be bold.'
    );
  });

  it('Apply color format to links as well', () => {
    const editor = hook.editor();
    editor.setContent('<p>123<a href="#">abc</a>456</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].lastChild as Text, 3);
    editor.selection.setRng(rng);

    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        color: '#FF0000'
      },
      links: true
    });
    editor.formatter.apply('format');

    assert.equal(
      editor.getContent(),
      '<p><span style="color: rgb(255, 0, 0);">123<a style="color: rgb(255, 0, 0);" href="#">abc</a>456</span></p>',
      `Link should have it's own color.`
    );
  });

  it('Color on link element', () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="font-size: 10px;">123<a href="#">abc</a>456</span></p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('span')[0].lastChild as Text, 3);
    editor.selection.setRng(rng);

    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        color: '#FF0000'
      },
      links: true
    });
    editor.formatter.apply('format');

    assert.equal(
      editor.getContent(),
      '<p><span style="color: rgb(255, 0, 0); font-size: 10px;">123<a style="color: rgb(255, 0, 0);" href="#">abc</a>456</span></p>',
      `Link should have it's own color.`
    );
  });

  it('Applying formats in lists', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>text<ul><li>nested</li></ul></li></ul>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('li')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('li')[0].firstChild as Text, 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('h1');
    assert.equal(
      editor.getContent(),
      '<ul><li><h1>text</h1><ul><li>nested</li></ul></li></ul>',
      'heading should not automatically apply to sublists'
    );
  });

  it('Applying block format to first character in li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>ab</li><li>cd</li>');
    LegacyUnit.setSelection(editor, 'li:nth-child(1)', 0, 'li:nth-child(1)', 0);
    editor.formatter.apply('h1');
    assert.equal(
      editor.getContent(),
      '<ul><li><h1>ab</h1></li><li>cd</li></ul>',
      'heading should be applied to first li'
    );
  });

  it('Applying block format to li wrapped in block', () => {
    const editor = hook.editor();
    editor.setContent('<div><ul><li>ab</li><li>cd</li></ul></div>');
    LegacyUnit.setSelection(editor, 'li:nth-child(1)', 1, 'li:nth-child(1)', 1);
    editor.formatter.apply('h1');
    assert.equal(
      editor.getContent(),
      '<div><ul><li><h1>ab</h1></li><li>cd</li></ul></div>',
      'heading should be applied to first li only'
    );
  });

  it('Applying formats on a list including child nodes', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'strong' });
    editor.setContent('<ol><li>a</li><li>b<ul><li>c</li><li>d<br /><ol><li>e</li><li>f</li></ol></li></ul></li><li>g</li></ol>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('li')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('li')[6].firstChild as Text, 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      editor.getContent(),
      '<ol><li><strong>a</strong></li><li><strong>b</strong><ul><li><strong>c</strong></li><li><strong>d</strong>' +
      '<br><ol><li><strong>e</strong></li><li><strong>f</strong></li></ol></li></ul></li><li><strong>g</strong>' +
      '</li></ol>',
      'should be applied to all sublists'
    );
  });

  it('Block format on li element', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>text<ul><li>nested</li></ul></li></ul>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('li')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('li')[1].firstChild as Text, 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('h1');
    assert.equal(
      editor.getContent(),
      '<ul><li><h1>text</h1><ul><li><h1>nested</h1></li></ul></li></ul>',
      'heading should automatically apply to sublists, when selection spans the sublist'
    );
  });

  it('Block on li element 2', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>before<ul><li>nested</li></ul>after</li></ul>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('li')[0].lastChild as Text, 1);
    rng.setEnd(editor.dom.select('li')[0].lastChild as Text, 2);
    editor.selection.setRng(rng);
    editor.formatter.apply('h1');
    assert.equal(
      editor.getContent(),
      '<ul><li>before<ul><li>nested</li></ul><h1>after</h1></li></ul>',
      'heading should automatically apply to sublists, when selection spans the sublist'
    );
  });

  it('Block on li element 3', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>before<ul><li>nested</li></ul>after</li></ul>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('li')[1].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('li')[0].lastChild as Text, 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('h1');
    assert.equal(
      editor.getContent(),
      '<ul><li>before<ul><li><h1>nested</h1></li></ul><h1>after</h1></li></ul>',
      'heading should automatically apply to sublists, when selection spans the sublist'
    );
  });

  it('Block on li element 4', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>before<ul><li>nested</li></ul>after</li></ul>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('li')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('li')[0].lastChild as Text, 1);
    editor.selection.setRng(rng);
    editor.formatter.apply('h1');
    assert.equal(
      editor.getContent(),
      '<ul><li><h1>before</h1><ul><li><h1>nested</h1></li></ul><h1>after</h1></li></ul>',
      'heading should apply correctly when selection is after a sublist'
    );
  });

  it('Underline colors 1', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        color: '#ff0000'
      }
    });
    editor.setContent(`<p><span style="font-family: 'arial black'; text-decoration: underline;">test</span></p>`);
    editor.execCommand('SelectAll');
    editor.formatter.apply('format');
    assert.equal(
      editor.getContent(),
      `<p><span style="color: rgb(255, 0, 0); font-family: 'arial black'; text-decoration: underline;">test</span></p>`,
      'Coloring an underlined text should result in a colored underline'
    );
  });

  it('Underline colors 2', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      exact: true,
      styles: {
        textDecoration: 'underline'
      }
    });
    editor.setContent(`<p><span style="font-family: 'arial black'; color: rgb(255, 0, 0);">test</span></p>`);
    editor.execCommand('SelectAll');
    editor.formatter.apply('format');
    assert.equal(
      editor.getContent(),
      '<p><span style="text-decoration: underline;"><span style="color: rgb(255, 0, 0); font-family: ' +
      `'arial black'; text-decoration: underline;">test</span></span></p>`,
      'Underlining colored text should result in a colored underline'
    );
  });

  it('Underline colors 3', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      exact: true,
      styles: {
        textDecoration: 'underline'
      }
    });
    editor.setContent(
      `<p><span style="font-family: 'arial black'; text-decoration: underline;"><em><strong>This is some ` +
      '<span style="color: rgb(255, 0, 0);">example</span></strong></em> text</span></p>'
    );
    editor.execCommand('SelectAll');
    editor.formatter.apply('format');
    assert.equal(
      editor.getContent(),
      `<p><span style="text-decoration: underline;"><span style="font-family: 'arial black';"><em>` +
      '<strong>This is some <span style="color: rgb(255, 0, 0); text-decoration: underline;">example</span></strong>' +
      '</em> text</span></span></p>', 'Underlining colored and underlined text should result in a colored underline'
    );
  });

  it('Underline colors 4', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        color: '#ff0000'
      }
    });
    editor.setContent(
      '<p style="font-size: 22pt;"><span style=\"text-decoration: underline;\"><span style=\"color: yellow; ' +
      'text-decoration: underline;\">yellowredyellow</span></span></p>'
    );
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[1].firstChild as Text, 6);
    rng.setEnd(editor.dom.select('span')[1].firstChild as Text, 9);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p style="font-size: 22pt;"><span style="text-decoration: underline;"><span style="color: yellow;' +
      ' text-decoration: underline;">yellow<span style="color: rgb(255, 0, 0); text-decoration: underline;">red</span>yellow</span></span></p>',
    'Coloring an colored underdlined text should result in newly colored underline'
    );
  });

  it('Underline colors 5', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      exact: true,
      styles: {
        textDecoration: 'underline'
      }
    });
    editor.setContent(
      `<p><span style="font-family: 'arial black','avant garde';"><em><strong>This is some <span style="color: ` +
      `rgb(255, 0, 0);">example</span></strong></em> text</span></p><p><span style="font-family: 'arial black',` +
      `'avant garde';"><em><strong>This is some <span style="color: rgb(255, 0, 0);">example</span></strong>` +
      `</em> text</span></p><p><span style="font-family: 'arial black', 'avant garde';"><em><strong>This is` +
      ` some <span style="color: rgb(255, 0, 0);">example</span></strong></em> text</span></p>`
    );
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('strong')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('span')[4].lastChild as Text, 5);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(
      editor.getContent(),
      `<p><span style="text-decoration: underline;"><span style="font-family: 'arial black','avant garde';"` +
      `><em><strong>This is some <span style="color: rgb(255, 0, 0); text-decoration: underline;">example</span></strong` +
      `></em> text</span></span></p><p><span style="text-decoration: underline;"><span style="font-family: ` +
      `'arial black','avant garde';"><em><strong>This is some <span style="color: rgb(255, 0, 0); text-decoration:` +
      ` underline;">example</span></strong></em> text</span></span></p><p><span style="text-decoration: underline;` +
      `"><span style="font-family: 'arial black', 'avant garde';"><em><strong>This is some <span style="color:` +
      ` rgb(255, 0, 0); text-decoration: underline;">example</span></strong></em> text</span></span></p>`,
      `Colored elements should be underlined when selection is across multiple paragraphs`
    );
  });

  it('Underline colors 6', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      exact: true,
      styles: {
        color: '#ff0000'
      }
    });
    editor.setContent('<p><span style="text-decoration: underline;">This is some text.</span></p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild as Text, 8);
    rng.setEnd(editor.dom.select('span')[0].firstChild as Text, 12);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    editor.formatter.remove('format');
    assert.equal(
      editor.getContent(),
      '<p><span style="text-decoration: underline;">This is some text.</span></p>',
      'Children nodes that are underlined should be removed if their parent nodes are underlined'
    );
  });

  it('Underline colors 7', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      exact: true,
      styles: {
        color: '#ff0000'
      }
    });
    editor.setContent(
      '<p><span style="text-decoration: underline;">This is <span style="color: #ff0000; text-decoration: underline; ' +
      'background-color: #ff0000">some</span> text.</span></p>'
    );
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[1].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('span')[1].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(
      editor.getContent(),
      '<p><span style=\"text-decoration: underline;\">This is <span style=\"background-color: rgb(255, 0, 0);\">' +
      'some</span> text.</span></p>',
      'Children nodes that are underlined should be removed if their parent nodes are underlined'
    );
  });

  it('Caret format inside single block word', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'p', 2, 'p', 2);
    editor.formatter.apply('format');
    TinyAssertions.assertContent(editor, '<p><b>abc</b></p>');
  });

  it('Caret format inside non-ascii single block word', () => {
    const editor = hook.editor();
    editor.setContent('<p>noël</p>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'p', 2, 'p', 2);
    editor.formatter.apply('format');
    TinyAssertions.assertContent(editor, '<p><b>noël</b></p>');
  });

  it('Caret format inside first block word', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc 123</p>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'p', 2, 'p', 2);
    editor.formatter.apply('format');
    TinyAssertions.assertContent(editor, '<p><b>abc</b> 123</p>');
  });

  it('Caret format inside last block word', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc 123</p>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'p', 5, 'p', 5);
    editor.formatter.apply('format');
    TinyAssertions.assertContent(editor, '<p>abc <b>123</b></p>');
  });

  it('Caret format inside middle block word', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc 123 456</p>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'p', 5, 'p', 5);
    editor.formatter.apply('format');
    TinyAssertions.assertContent(editor, '<p>abc <b>123</b> 456</p>');
  });

  it('Caret format on word separated by non breaking space', () => {
    const editor = hook.editor();
    editor.setContent('<p>one&nbsp;two</p>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'p', 1, 'p', 1);
    editor.formatter.apply('format');
    TinyAssertions.assertContent(editor, '<p><b>one</b>\u00a0two</p>');
  });

  it('Caret format inside single inline wrapped word', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc <em>123</em> 456</p>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'em', 1, 'em', 1);
    editor.formatter.apply('format');
    TinyAssertions.assertContent(editor, '<p>abc <b><em>123</em></b> 456</p>');
  });

  it('Caret format inside word before similar format', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc 123 <b>456</b></p>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'p', 1, 'p', 1);
    editor.formatter.apply('format');
    TinyAssertions.assertContent(editor, '<p><b>abc</b> 123 <b>456</b></p>');
  });

  it('Caret format inside last inline wrapped word', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc <em>abc 123</em> 456</p>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'em', 5, 'em', 5);
    editor.formatter.apply('format');
    TinyAssertions.assertContent(editor, '<p>abc <em>abc <b>123</b></em> 456</p>');
  });

  it('Caret format before text', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 0);
    editor.formatter.apply('format');
    KeyUtils.type(editor, 'b');
    TinyAssertions.assertContent(editor, '<p><b>b</b>a</p>');
  });

  it('Caret format after text', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'p', 1, 'p', 1);
    editor.formatter.apply('format');
    KeyUtils.type(editor, 'b');
    TinyAssertions.assertContent(editor, '<p>a<b>b</b></p>');
  });

  it('Caret format and no key press', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 0);
    editor.formatter.apply('format');
    TinyAssertions.assertContent(editor, '<p>a</p>');
  });

  it('Caret format and arrow left', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 0);
    editor.formatter.apply('format');
    KeyUtils.type(editor, {
      keyCode: 37
    });
    TinyAssertions.assertContent(editor, '<p>a</p>');
  });

  it('Caret format and arrow right', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 0);
    editor.formatter.apply('format');
    KeyUtils.type(editor, {
      keyCode: 39
    });
    TinyAssertions.assertContent(editor, '<p>a</p>');
  });

  it('Caret format and backspace', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });

    editor.setContent('<p>abc</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 3);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 3);
    editor.selection.setRng(rng);

    editor.formatter.apply('format');
    KeyUtils.type(editor, '\b');
    TinyAssertions.assertContent(editor, '<p>ab</p>');
  });

  it('Caret format on word in li with word in parent li before it', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>one<ul><li>two</li></ul></li></ul>');
    editor.formatter.register('format', {
      inline: 'b'
    });
    LegacyUnit.setSelection(editor, 'ul li li', 1, 'ul li li', 1);
    editor.formatter.apply('format');
    TinyAssertions.assertContent(editor, '<ul><li>one<ul><li><b>two</b></li></ul></li></ul>');
  });

  it('Format caret with multiple formats', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><br></p>';
    editor.formatter.register('format1', { inline: 'b' });
    editor.formatter.register('format2', { inline: 'i' });
    editor.selection.setCursorLocation(editor.getBody().firstChild as HTMLParagraphElement, 0);
    editor.formatter.apply('format1');
    editor.formatter.apply('format2');
    assert.equal(1, editor.dom.select('b').length, 'Should be one b element');
    assert.equal(1, editor.dom.select('i').length, 'Should be one i element');
  });

  it('Selector format on whole contents', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    editor.formatter.register('format', {
      inline: 'span',
      selector: '*',
      classes: 'test'
    });
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.formatter.apply('format');
    TinyAssertions.assertContent(editor, '<p class="test">a</p>');
  });

  it('format inline on contentEditable: false block', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.setContent('<p>abc</p><p contenteditable="false">def</p>');
    editor.selection.select(editor.getBody().childNodes[1]);
    editor.formatter.apply('format');
    assert.equal(editor.getContent(), '<p>abc</p><p contenteditable="false">def</p>', 'Text is not bold');
  });

  it('format block on contentEditable: false block', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      block: 'h1'
    });
    editor.setContent('<p>abc</p><p contenteditable="false">def</p>');
    editor.selection.select(editor.getBody().childNodes[1]);
    editor.formatter.apply('format');
    assert.equal(editor.getContent(), '<p>abc</p><p contenteditable="false">def</p>', 'P is not h1');
  });

  it('contentEditable: false on start and contentEditable: true on end', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.setContent('<p>abc</p><p contenteditable="false">def</p><p>ghi</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[2].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[2].firstChild as Text, 3);
    editor.selection.setRng(rng);
    editor.formatter.apply('format');
    assert.equal(editor.getContent(), '<p>abc</p><p contenteditable="false">def</p><p><b>ghi</b></p>', 'Text in last paragraph is bold');
  });

  it('contentEditable: true inside contentEditable: false', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'b'
    });
    editor.setContent('<p>abc</p><p contenteditable="false"><span contenteditable="true">def</span></p>');
    LegacyUnit.setSelection(editor, 'span', 0, 'span', 3);
    editor.formatter.apply('format');
    assert.equal(editor.getContent(), '<p>abc</p><p contenteditable="false"><span contenteditable="true"><b>def</b></span></p>', 'Text is bold');
  });

  it('Div element wrapping blocks', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.formatter.register('format', {
      block: 'div',
      wrapper: true
    });
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<div><p>a</p></div>');
  });

  it('Del element as inline', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.formatter.register('format', {
      inline: 'del'
    });
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><del>a</del></p>');
  });

  it('Align specified table element with collapsed: false and selection collapsed', () => {
    const editor = hook.editor();
    editor.setContent('<table><tr><td>a</td></tr></table>');
    LegacyUnit.setSelection(editor, 'td', 0, 'td', 0);
    editor.formatter.register('format', {
      selector: 'table',
      collapsed: false,
      styles: {
        float: 'right'
      }
    });
    editor.formatter.apply('format', {}, editor.getBody().firstChild);
    assert.equal(getContent(editor), '<table style="float: right;"><tbody><tr><td>a</td></tr></tbody></table>');
  });

  it('Align nested table cell to same as parent', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tbody>' +
      '<tr>' +
      '<td style="text-align: right;">a' +
      '<table>' +
      '<tbody>' +
      '<tr>' +
      '<td><b>b</b></td>' +
      '</tr>' +
      '</tbody>' +
      '</table>' +
      '</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>'
    );

    LegacyUnit.setSelection(editor, 'b', 0);

    editor.formatter.register('format', {
      selector: 'td',
      styles: {
        'text-align': 'right'
      }
    });

    editor.formatter.apply('format', {}, editor.dom.select('td td')[0]);

    assert.equal(
      getContent(editor),
      '<table>' +
      '<tbody>' +
      '<tr>' +
      '<td style="text-align: right;">a' +
      '<table>' +
      '<tbody>' +
      '<tr>' +
      '<td style="text-align: right;"><b>b</b></td>' +
      '</tr>' +
      '</tbody>' +
      '</table>' +
      '</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('Apply ID format to around existing bookmark node', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a<span id="b" data-mce-type="bookmark"></span>b</p>';

    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].lastChild as Text, 1);
    editor.selection.setRng(rng);

    editor.formatter.register('format', {
      inline: 'span',
      attributes: {
        id: 'custom-id'
      }
    });
    editor.formatter.apply('format');

    TinyAssertions.assertRawContent(editor, '<p><span id="custom-id">a<span id="b" data-mce-type="bookmark"></span>b</span></p>');
  });

  it('Bug #5134 - TinyMCE removes formatting tags in the getContent', () => {
    const editor = hook.editor();
    editor.setContent('');
    editor.formatter.register('format', {
      inline: 'strong',
      toggle: false
    });
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '', 'empty TinyMCE');
    editor.selection.setContent('a');
    assert.equal(getContent(editor), '<p><strong>a</strong></p>', 'bold text inside TinyMCE');
  });

  it('Bug #5134 - TinyMCE removes formatting tags in the getContent - typing', () => {
    const editor = hook.editor();
    editor.setContent('');
    editor.formatter.register('format', {
      inline: 'strong',
      toggle: false
    });
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '', 'empty TinyMCE');
    KeyUtils.type(editor, 'a');
    assert.equal(getContent(editor), '<p><strong>a</strong></p>', 'bold text inside TinyMCE');
  });

  it('Bug #5453 - TD contents with BR gets wrapped in block format', () => {
    const editor = hook.editor();
    editor.setContent('<table><tr><td>abc<br />123</td></tr></table>');
    LegacyUnit.setSelection(editor, 'td', 1, 'td', 1);
    editor.formatter.register('format', {
      block: 'h1'
    });
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<table><tbody><tr><td><h1>abc</h1>123</td></tr></tbody></table>');
  });

  it('Bug #6471 - Merge left/right style properties', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        fontWeight: 'bold'
      }
    });
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 2, 'p', 3);
    editor.formatter.apply('format');
    LegacyUnit.setSelection(editor, 'p', 1, 'p', 2);
    editor.formatter.apply('format');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.formatter.apply('format');
    TinyAssertions.assertContent(editor, '<p><span style="font-weight: bold;">abc</span></p>');
  });

  it('merge_with_parents', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        fontWeight: 'bold'
      },
      merge_with_parents: true
    });
    editor.setContent('<p><span style="color: red">a</span></p>');
    LegacyUnit.setSelection(editor, 'span', 0, 'span', 1);
    editor.formatter.apply('format');
    TinyAssertions.assertContent(editor, '<p><span style="color: red; font-weight: bold;">a</span></p>');
  });

  it('Format selection from with end at beginning of block', () => {
    const editor = hook.editor();
    editor.setContent(`<div id='a'>one</div><div id='b'>two</div>`);
    editor.focus();
    LegacyUnit.setSelection(editor, '#a', 0, '#b', 0);
    editor.execCommand('formatBlock', false, 'h1');
    assert.equal(getContent(editor), '<h1 id="a">one</h1><div id="b">two</div>');
  });

  it('Format selection over fragments', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>a</strong>bc<em>d</em></p>');
    LegacyUnit.setSelection(editor, 'strong', 1, 'em', 0);
    editor.formatter.apply('underline');
    assert.equal(getContent(editor), '<p><strong>a</strong><span style="text-decoration: underline;">bc</span><em>d</em></p>');
  });

  it(`Child wrapper having the same format as the immediate parent, shouldn't be removed if it also has other formats merged`, () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><span style="font-family: verdana;">a <span style="color: #ff0000;">b</span>c</span></p>';
    LegacyUnit.setSelection(editor, 'span span', 0, 'span span', 1);
    editor.formatter.apply('fontname', { value: 'verdana' });
    assert.equal(getContent(editor), '<p><span style="font-family: verdana;">a <span style="color: rgb(255, 0, 0);">b</span>c</span></p>');
  });

  it('FontName should not toggle', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>abc</p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 3);
    editor.formatter.toggle('fontname', { value: 'arial' });
    assert.equal(getContent(editor), '<p><span style="font-family: arial;">abc</span></p>');
    LegacyUnit.setSelection(editor, 'span', 0, 'span', 3);
    editor.formatter.toggle('fontname', { value: 'arial' });
    assert.equal(getContent(editor), '<p><span style="font-family: arial;">abc</span></p>');
  });

  it('FontSize should not toggle', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>abc</p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 3);
    editor.formatter.toggle('fontsize', { value: '14pt' });
    assert.equal(getContent(editor), '<p><span style="font-size: 14pt;">abc</span></p>');
    LegacyUnit.setSelection(editor, 'span', 0, 'span', 3);
    editor.formatter.toggle('fontsize', { value: '14pt' });
    assert.equal(getContent(editor), '<p><span style="font-size: 14pt;">abc</span></p>');
  });

  it('All the nested childNodes having fontSize should receive backgroundColor as well', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a <span style="font-size: 36pt;">b</span> c</p>';
    editor.selection.select(editor.dom.select('p')[0]);

    editor.formatter.apply('hilitecolor', { value: '#ff0000' });
    assert.equal(
      getContent(editor),
      '<p><span style="background-color: rgb(255, 0, 0);">a <span style="font-size: 36pt; background-color: rgb(255, 0, 0);">b</span> c</span></p>'
    );

    editor.formatter.remove('hilitecolor', { value: '#ff0000' });
    assert.equal(getContent(editor), '<p>a <span style="font-size: 36pt;">b</span> c</p>');
  });

  it('Formatter should wrap elements that have data-mce-bogus attribute, rather then attempt to inject styles into it', () => {
    const editor = hook.editor();
    // add a class to retain bogus element
    editor.getBody().innerHTML = '<p>That is a <span class="mce-spellchecker-word" data-mce-bogus="1">misespelled</span> text</p>';
    editor.selection.select(editor.dom.select('span')[0]);

    editor.formatter.apply('fontname', { value: 'verdana' });

    TinyAssertions.assertRawContent(editor,
      '<p>That is a <span style="font-family: verdana;" data-mce-style="font-family: verdana;"><span class="mce-spellchecker-word" data-mce-bogus="1">misespelled</span></span> text</p>');

    assert.equal(getContent(editor),
      '<p>that is a <span style="font-family: verdana;">misespelled</span> text</p>');

    editor.selection.select(editor.dom.select('span')[0]);
    editor.formatter.remove('fontname', { value: 'verdana' });

    TinyAssertions.assertRawContent(editor,
      '<p>That is a <span class="mce-spellchecker-word" data-mce-bogus="1">misespelled</span> text</p>');

    assert.equal(getContent(editor),
      '<p>that is a misespelled text</p>');
  });

  it('TINY-1180: Formatting gets applied outside the currently selected range', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a <em><em>em</em> </em></p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'em em', 0);
    editor.formatter.apply('strikethrough');
    assert.equal(getContent(editor), '<p><s>a </s><em><em>em</em> </em></p>');
  });

  it('Superscript on subscript removes the subscript element', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><sub>a</sub></p>';
    LegacyUnit.setSelection(editor, 'sub', 0, 'sub', 1);
    editor.formatter.apply('superscript');
    assert.equal(getContent(editor), '<p><sup>a</sup></p>');
  });

  it('Subscript on superscript removes the superscript element', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><sup>a</sup></p>';
    LegacyUnit.setSelection(editor, 'sup', 0, 'sup', 1);
    editor.formatter.apply('subscript');
    assert.equal(getContent(editor), '<p><sub>a</sub></p>');
  });

  it(`TINY-782: Can't apply sub/sup to word on own line with large font`, () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><span style="font-size: 18px;">abc</span></p>';
    LegacyUnit.setSelection(editor, 'span', 0, 'span', 3);
    editor.formatter.apply('superscript');
    assert.equal(getContent(editor), '<p><sup>abc</sup></p>');
  });

  it('TINY-782: Apply sub/sup to range with multiple font sizes', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a<span style="font-size: 18px;">b</span><span style="font-size: 24px;">c</span></p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'span:nth-child(2)', 1);
    editor.formatter.apply('superscript');
    assert.equal(getContent(editor), '<p><sup>abc</sup></p>');
  });

  it('TINY-671: Background color on nested font size bug', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><strong><span style="font-size: 18px;">abc</span></strong></p>';
    LegacyUnit.setSelection(editor, 'span', 0, 'span', 3);
    editor.formatter.apply('hilitecolor', { value: '#ff0000' });
    assert.equal(getContent(editor), '<p><span style="background-color: rgb(255, 0, 0);"><strong><span style="font-size: 18px; background-color: rgb(255, 0, 0);">abc</span></strong></span></p>');
  });

  it('Background color over range of font sizes', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a<span style="font-size: 18px;">b</span><span style="font-size: 24px;">c</span></p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'span:nth-child(2)', 1);
    editor.formatter.apply('hilitecolor', { value: '#ff0000' });
    assert.equal(
      getContent(editor),
      '<p><span style="background-color: rgb(255, 0, 0);">a<span style="font-size: 18px; background-color: rgb(255, 0, 0);">b</span><span style="font-size: 24px; background-color: rgb(255, 0, 0);">c</span></span></p>'
    );
  });

  it('TINY-865: Font size removed when changing background color', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = (
      '<p><span style="background-color: #ffff00;"><span style="font-size: 8pt;">a</span> ' +
      '<span style="font-size: 36pt;">b</span> <span style="font-size: 8pt;">c</span></span></p>'
    );
    LegacyUnit.setSelection(editor, 'span span:nth-child(2)', 0, 'span span:nth-child(2)', 1);
    editor.formatter.apply('hilitecolor', { value: '#ff0000' });
    assert.equal(
      getContent(editor),
      '<p><span style="background-color: #ffff00;"><span style="font-size: 8pt;">a</span> <span ' +
      'style="font-size: 36pt; background-color: rgb(255, 0, 0);">b</span> <span style="font-size: 8pt;">c</span></span></p>'
    );
  });

  it(`TINY-935: Text color, then size, then change color wraps span doesn't change color`, () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><span style="color: #00ff00; font-size: 14pt;">text</span></p>';
    LegacyUnit.setSelection(editor, 'span', 0, 'span', 4);
    editor.formatter.apply('forecolor', { value: '#ff0000' });
    assert.equal(getContent(editor), '<p><span style="color: rgb(255, 0, 0); font-size: 14pt;">text</span></p>');
  });

  it('GH-3519: Font family selection does not work after changing font size', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = `<p><span style="font-size: 14pt; font-family: 'comic sans ms', sans-serif;">text</span></p>`;
    LegacyUnit.setSelection(editor, 'span', 0, 'span', 4);
    editor.formatter.apply('fontname', { value: 'verdana' });
    assert.equal(getContent(editor), '<p><span style="font-size: 14pt; font-family: verdana;">text</span></p>');
  });

  it('Formatter should remove similar styles when clear_child_styles is set to true', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = (
      '<p><span style="font-family: Arial; font-size: 13px">a</span>' +
      '<del style="font-family: Arial; font-size: 13px">b</del>' +
      '<span style="font-size: 13px">c</span></p>'
    );

    editor.selection.select(editor.dom.select('p')[0]);

    editor.formatter.register('format', { inline: 'span', styles: { fontSize: '14px' }, clear_child_styles: true });
    editor.formatter.apply('format');

    assert.equal(
      getContent(editor),
      '<p><span style="font-size: 14px;"><span style="font-family: arial;">a</span><del style="font-family: arial;">b</del>c</span></p>'
    );
  });

  it(`If links=true, formatter shouldn't remove similar styles from links even if clear_child_styles=true`, () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a<a href="#">b</a>c</p>';

    editor.selection.select(editor.dom.select('p')[0]);

    editor.formatter.register('format', { inline: 'span', styles: { fontSize: '14px' }, links: true, clear_child_styles: true });
    editor.formatter.apply('format');

    assert.equal(
      getContent(editor),
      '<p><span style="font-size: 14px;">a<a style="font-size: 14px;" href="#">b</a>c</span></p>'
    );
  });

  it(`Formatter should remove similar styles when clear_child_styles isn't defined`, () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = (
      '<p><span style="font-family: Arial; font-size: 13px">a</span>' +
      '<del style="font-family: Arial; font-size: 13px">b</del>' +
      '<span style="font-size: 13px">c</span></p>'
    );

    editor.selection.select(editor.dom.select('p')[0]);

    editor.formatter.register('format', { inline: 'span', styles: { fontSize: '14px' }});
    editor.formatter.apply('format');

    assert.equal(
      getContent(editor),
      '<p><span style="font-size: 14px;"><span style="font-family: arial;">a</span><del style="font-size: 13px; font-family: arial;">b</del>c</span></p>'
    );
  });

  it('register/unregister', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'span' });
    Assertions.assertEq('Should have format', true, !!editor.formatter.get('format'));
    editor.formatter.unregister('format');
    Assertions.assertEq('Should not have format', false, !!editor.formatter.get('format'));
  });

  it('Get all formats', () => {
    const editor = hook.editor();
    Assertions.assertEq('Should have a bunch of formats', true, Obj.keys(editor.formatter.get()).length > 0);
  });

  it('Apply ceFalseOverride format', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">a</p><div contenteditable="false">b</div>');
    editor.formatter.register('format', { selector: 'div', classes: [ 'a' ], ceFalseOverride: true });

    editor.selection.select(editor.dom.select('p')[0]);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p contenteditable="false">a</p><div contenteditable="false">b</div>'
    );

    editor.selection.select(editor.dom.select('div')[0]);
    editor.formatter.apply('format');
    assert.equal(
      getContent(editor),
      '<p contenteditable="false">a</p><div class="a" contenteditable="false">b</div>'
    );
  });

  it('Apply format including trailing space', () => {
    const editor = hook.editor();
    editor.setContent('<p>a b</p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 2);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>a </b>b</p>');
  });

  it('Apply format on single space', () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp; &nbsp; &nbsp;b</p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'p', 2, 'p', 3);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p>a\u00a0<b> </b>\u00a0 \u00a0b</p>');
  });

  it('Apply format on multiple spaces', () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp; &nbsp; &nbsp;b</p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'p', 2, 'p', 5);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p>a\u00a0<b> \u00a0 </b>\u00a0b</p>');
  });

  it('Apply format with onformat handler', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    editor.formatter.register('format', {
      inline: 'span',
      onformat: (elm: Element) => {
        elm.className = 'x';
      }
    });
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><span class="x">a</span></p>');
  });

  it('Apply format to triple clicked selection (webkit)', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><ul><li>a</li><li>b</li></ul>');
    editor.formatter.register('format', { inline: 'b' });

    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('li')[0], 0);
    editor.selection.setRng(rng);

    editor.formatter.apply('format');
    assert.equal(getContent(editor), '<p><b>a</b></p><ul><li>a</li><li>b</li></ul>');
  });

  it('Applying background color to partially selected contents', () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="background-color: #ff0000;">ab<span style="font-size: 32px;">cd</span><strong>ef</strong></span></p>');
    LegacyUnit.setSelection(editor, 'span span', 1, 'strong', 1);
    editor.formatter.apply('hilitecolor', { value: '#00ff00' });
    assert.equal(getContent(editor),
      '<p>' +
        '<span style="background-color: #ff0000;">ab<span style="font-size: 32px;">c<span style="background-color: rgb(0, 255, 0);">d</span></span><strong><span style="background-color: rgb(0, 255, 0);">e</span>f</strong></span>' +
      '</p>');
  });

  it('Apply format to node outside fake table selection', () => {
    const editor = hook.editor();
    editor.setContent('<p>test</p><table><tbody><tr><td data-mce-selected="1">cell 1</td><td>cell 2</td></tr><tr><td data-mce-selected="1">cell 3</td><td>cell 4</td></tr></tbody></table>');
    LegacyUnit.setSelection(editor, 'td', 0, 'td', 0);
    const para = editor.dom.select('p')[0];
    // Apply to custom node
    editor.formatter.apply('bold', { }, para);
    assert.equal(getContent(editor), '<p><strong>test</strong></p><table><tbody><tr><td>cell 1</td><td>cell 2</td></tr><tr><td>cell 3</td><td>cell 4</td></tr></tbody></table>');
    // Apply to current fake table selection
    editor.formatter.apply('bold');
    assert.equal(getContent(editor), '<p><strong>test</strong></p><table><tbody><tr><td><strong>cell 1</strong></td><td>cell 2</td></tr><tr><td><strong>cell 3</strong></td><td>cell 4</td></tr></tbody></table>');
  });

  it('TINY-6567: Apply format including the final bullet point in the list', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li>a</li>' +
        '<li>b<br />' +
          '<ul>' +
            '<li>c</li>' +
            '<li>d</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 1, 2, 1 ], 1);
    editor.formatter.apply('aligncenter');
    assert.equal(getContent(editor),
      '<ul>' +
        '<li style="text-align: center;">a</li>' +
        '<li style="text-align: center;">b<br>' +
          '<ul>' +
            '<li style="text-align: center;">c</li>' +
            '<li style="text-align: center;">d</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );
  });

  it('TINY-6567: Apply aligncenter to a partially select child list', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
        '<li>a</li>' +
        '<li>b<br />' +
          '<ol>' +
            '<li>c</li>' +
            '<li>d</li>' +
          '</ol>' +
        '</li>' +
      '</ol>'
    );
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 1, 2, 0 ], 1);
    editor.formatter.apply('aligncenter');
    assert.equal(getContent(editor),
      '<ol>' +
        '<li style="text-align: center;">a</li>' +
        '<li style="text-align: center;">b<br>' +
          '<ol>' +
            '<li style="text-align: center;">c</li>' +
            '<li>d</li>' +
          '</ol>' +
        '</li>' +
      '</ol>'
    );
  });

  it('TINY-7393: Apply aligncenter to lists with other formatting', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li>a</li>' +
        '<li><strong>b</strong><br />' +
          '<ul>' +
            '<li>c</li>' +
            '<li>d</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 1, 2, 1 ], 1);
    editor.formatter.apply('aligncenter');
    assert.equal(getContent(editor),
      '<ul>' +
        '<li style="text-align: center;">a</li>' +
        '<li style="text-align: center;"><strong>b</strong><br>' +
          '<ul>' +
            '<li style="text-align: center;">c</li>' +
            '<li style="text-align: center;">d</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );
  });

  it('TINY-6567: Apply alignright to the last li but not to its children', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li>a</li>' +
        '<li>b<br />' +
          '<ul>' +
            '<li>c</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 1 ], 1);
    editor.formatter.apply('alignright');
    assert.equal(getContent(editor),
      '<ul>' +
        '<li style="text-align: right;">a</li>' +
        '<li style="text-align: right;">b<br>' +
          '<ul>' +
            '<li>c</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );
  });

  it('TINY-6567: Apply h1 to nested list with multiple levels', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li>1</li>' +
        '<li>2' +
          '<ul>' +
            '<li>a</li>' +
            '<li>b' +
              '<ul>' +
                '<li>i</li>' +
                '<li>ii</li>' +
              '</ul>' +
            '</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 1, 1, 1, 1, 1 ], 0);
    editor.formatter.apply('h1');
    assert.equal(getContent(editor),
      '<ul>' +
        '<li><h1>1</h1></li>' +
        '<li><h1>2</h1>' +
          '<ul>' +
            '<li><h1>a</h1></li>' +
            '<li><h1>b</h1>' +
              '<ul>' +
                '<li><h1>i</h1></li>' +
                '<li><h1>ii</h1></li>' +
              '</ul>' +
            '</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );
  });

  it('TINY-6567: Apply align center to a div structure', () => {
    const editor = hook.editor();
    editor.setContent(
      '<div>' +
        '<div>a</div>' +
        '<div><br />b' +
          '<div>1</div>' +
        '</div>' +
        '<div>c</div>' +
        '<div>d</div>' +
      '</div>'
    );
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 1, 2, 0 ], 0);
    editor.formatter.apply('aligncenter');
    assert.equal(getContent(editor),
      '<div>' +
        '<div style="text-align: center;">a</div>' +
        '<div style="text-align: center;"><br>b' +
          '<div style="text-align: center;">1</div>' +
        '</div>' +
        '<div>c</div>' +
        '<div>d</div>' +
      '</div>'
    );
  });

  it('TINY-6567: Apply inline element with font size to a div structure with a partial selection', () => {
    const editor = hook.editor();
    editor.setContent(
      '<div>' +
        '<div>a</div>' +
        '<div>b' +
          '<div>c</div>' +
          '<div>d</div>' +
          '<div>e</div>' +
        '</div>' +
      '</div>'
    );
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 1, 1 ], 1);
    editor.formatter.register('formatTest', {
      inline: 'b',
      styles: {
        fontSize: '14px'
      }
    });
    editor.formatter.apply('formatTest');
    assert.equal(getContent(editor),
      '<div>' +
        '<div><b style="font-size: 14px;">a</b></div>' +
        '<div><b style="font-size: 14px;">b</b>' +
          '<div><b style="font-size: 14px;">c</b></div>' +
          '<div>d</div>' +
          '<div>e</div>' +
        '</div>' +
      '</div>'
    );
  });

  it('TINY-7227: Apply classes with variables', () => {
    const editor = hook.editor();
    editor.focus();
    editor.formatter.register('formatA', { selector: 'p', classes: [ '%value' ] });

    editor.setContent('<p>test</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 0);

    editor.formatter.apply('formatA', { value: 'a' });
    editor.formatter.apply('formatA', { value: 'b' });
    assert.equal(getContent(editor), '<p class="a b">test</p>');
  });

  it('TINY-8036: Apply blockquote with multiple words and collapsed selection', () => {
    const editor = hook.editor();
    editor.setContent('<p>test test</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 7);
    editor.formatter.apply('blockquote');
    TinyAssertions.assertContent(editor, '<blockquote><p>test test</p></blockquote>');
  });

  it('TINY-9678: Should be a noop if selection is not in an editable context', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      const initialContent = '<p>test</p><p contenteditable="true">editable</p>';
      editor.setContent(initialContent);
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
      editor.formatter.apply('bold');
      TinyAssertions.assertContent(editor, initialContent);
    });
  });

  it('TINY-9887: Should not be noop if selection is not in an editable context but a custom editable node is specified', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<p>test</p><p contenteditable="true">editable</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
      editor.formatter.apply('bold', {}, Hierarchy.follow(TinyDom.body(editor), [ 1 ]).getOrDie().dom);
      TinyAssertions.assertContent(editor, '<p>test</p><p contenteditable="true"><strong>editable</strong></p>');
    });
  });

  it('TINY-10154: should apply heading formatting to summary content', () => {
    const editor = hook.editor();
    editor.setContent('<details><summary>hello<em>world</em></summary>body</details>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.formatter.apply('h1');
    TinyAssertions.assertContent(editor, '<details><summary><h1>hello<em>world</em></h1></summary>body</details>');
  });
});

import { ApproxStructure, StructAssert } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Type } from '@ephox/katamari';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.models.dom.table.TableSizingModeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    width: 800,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const test = (editor: Editor, assertion: ApproxStructure.Builder<StructAssert>, defaultStyles?: Record<string, string>) => {
    editor.setContent('');
    if (Type.isObject(defaultStyles)) {
      editor.options.set('table_default_styles', defaultStyles);
    } else {
      editor.options.unset('table_default_styles');
    }
    editor.execCommand('mceInsertTable', false, { rows: 2, columns: 2 });
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => s.element('body', {
      children: [ assertion(s, str, arr), s.theRest() ]
    })));
  };

  it('TINY-6051: Should default to a percentage width when inserting new tables', () => {
    const editor = hook.editor();
    editor.options.unset('table_sizing_mode');
    test(editor, (s, str) => s.element('table', {
      styles: {
        'border-collapse': str.is('collapse'),
        'width': str.is('100%')
      }
    }));
    test(editor, (s, str) => s.element('table', {
      styles: {
        'border-collapse': str.none(),
        'width': str.is('600px')
      }
    }), { width: '600px' });
  });

  it('TINY-6051: Relative sizing should default to a percentage width when inserting new tables', () => {
    const editor = hook.editor();
    editor.options.set('table_sizing_mode', 'relative');
    test(editor, (s, str) => s.element('table', {
      styles: {
        'border-collapse': str.is('collapse'),
        'width': str.is('100%')
      }
    }));
    test(editor, (s, str) => s.element('table', {
      styles: {
        'border-collapse': str.none(),
        'width': str.contains('%')
      }
    }), { width: '750px' });
  });

  it('TINY-6051: Fixed sizing should default to a pixel width when inserting new tables', () => {
    const editor = hook.editor();
    editor.options.set('table_sizing_mode', 'fixed');
    test(editor, (s, str) => s.element('table', {
      styles: {
        'border-collapse': str.is('collapse'),
        'width': str.contains('px')
      }
    }));

    const table = editor.dom.select('table')[0];
    assert.equal(table.offsetWidth, editor.getBody().offsetWidth, 'Table is the same width as the body');
    test(editor, (s, str) => s.element('table', {
      styles: {
        'border-collapse': str.none(),
        'width': str.contains('px')
      }
    }), { width: '100%' });
  });

  it('TINY-6051: Responsive sizing should default to no width when inserting new tables', () => {
    const editor = hook.editor();
    editor.options.set('table_sizing_mode', 'responsive');
    test(editor, (s, str) => s.element('table', {
      styles: {
        'border-collapse': str.is('collapse'),
        'width': str.none()
      }
    }));
    test(editor, (s, str) => s.element('table', {
      styles: {
        'border-collapse': str.none(),
        'width': str.none()
      }
    }), { width: '400px' });
  });
});

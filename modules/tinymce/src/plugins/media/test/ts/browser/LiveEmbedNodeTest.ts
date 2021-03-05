import { ApproxStructure, Assertions, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { TinyDom, TinyHooks } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.media.core.LiveEmbedNodeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  const assertStructure = (editor: Editor, tag: string, classes: string[], attrs: Record<string, string>, styles: Record<string, string>) => {
    const object = UiFinder.findIn(TinyDom.body(editor), 'span.mce-preview-object').getOrDie();
    Assertions.assertStructure('should have all attributes', ApproxStructure.build((s, str, arr) => s.element('span', {
      classes: [ arr.has('mce-object-' + tag) ],
      styles: {
        height: str.none('should not have height style'),
        width: str.none('should not have width style'),
        // TINY-7074: The wrapper span should have the same width/height styles
        ...Obj.map(styles, (value) => str.is(value))
      },
      children: [
        s.element(tag, {
          classes: Arr.map(classes, arr.has),
          attrs: {
            height: str.none('should not have height'),
            width: str.none('should not have width'),
            ...Obj.map(attrs, (value) => str.is(value))
          },
          styles: {
            height: str.none('should not have height style'),
            width: str.none('should not have width style'),
            ...Obj.map(styles, (value) => str.is(value))
          }
        }),
        s.zeroOrOne(s.element('span', {
          classes: [ arr.has('mce-shim') ]
        }))
      ]
    })), object);
  };

  it('TBA: iframe with class and style, no width & height attribs', () => {
    const editor = hook.editor();
    editor.setContent('<iframe class="test-class" style="height: 250px; width: 500px;" src="about:blank"></iframe>');
    assertStructure(editor, 'iframe', [ 'test-class' ], { src: 'about:blank' }, { width: '500px', height: '250px' });
  });

  it('TBA: iframe with class, style and width & height attribs', () => {
    const editor = hook.editor();
    editor.setContent('<iframe class="test-class" style="height: 250px; width: 500px;" width="300" height="150" src="about:blank"></iframe>');
    assertStructure(editor, 'iframe', [ 'test-class' ], { src: 'about:blank', width: '300', height: '150' }, { width: '500px', height: '250px' });
  });

  it('TBA: iframe with width & height attribs', () => {
    const editor = hook.editor();
    editor.setContent('<iframe width="300" height="150" src="about:blank"></iframe>');
    assertStructure(editor, 'iframe', [ ], { width: '300', height: '150' }, { });
  });

  it('TINY-6229: video with class and style, no width & height attribs', () => {
    const editor = hook.editor();
    editor.setContent('<video class="test-class" style="height: 250px; width: 500px;" src="about:blank"></video>');
    assertStructure(editor, 'video', [ 'test-class' ], { src: 'about:blank' }, { width: '500px', height: '250px' });
  });

  it('TINY-6229: video with controls, width & height attribs, no width & height styles', () => {
    const editor = hook.editor();
    editor.setContent('<video controls="controls" style="padding: 4px" width="300" height="150" src="about:blank"></video>');
    assertStructure(editor, 'video', [ ], { controls: 'controls', src: 'about:blank', width: '300', height: '150' }, { padding: '4px' });
  });

  it('TINY-6229: video with controls, no width & height styles or styles defaults to 300x150', () => {
    const editor = hook.editor();
    editor.setContent('<video controls="controls" src="about:blank"></video>');
    assertStructure(editor, 'video', [ ], { controls: 'controls', width: '300', height: '150' }, { });
  });

  it('TINY-6229: audio with class and style, no width & height attribs', () => {
    const editor = hook.editor();
    editor.setContent('<audio class="test-class" style="height: 250px; width: 500px;" src="about:blank"></audio>');
    assertStructure(editor, 'audio', [ 'test-class' ], { src: 'about:blank' }, { width: '500px', height: '250px' });
  });

  it('TINY-6229: audio with controls, no width & height attribs', () => {
    const editor = hook.editor();
    editor.setContent('<audio controls="controls" src="about:blank"></audio>');
    assertStructure(editor, 'audio', [ ], { controls: 'controls', src: 'about:blank' }, { });
  });

  it('TINY-7074: iframe element with responsive styles', () => {
    const editor = hook.editor();
    editor.setContent('<div style="width: 100%; height: 0; padding-top: 50%;"><iframe style="width: 100%; height: 100%;"></iframe></div>');
    assertStructure(editor, 'iframe', [ ], { }, { width: '100%', height: '100%' });
  });
});

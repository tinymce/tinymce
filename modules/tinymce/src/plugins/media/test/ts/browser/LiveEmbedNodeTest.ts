import { ApproxStructure, Assertions, StructAssert, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Obj, Type } from '@ephox/katamari';
import { McEditor, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';

describe('browser.tinymce.plugins.media.core.LiveEmbedNodeTest', () => {
  const baseSettings = {
    plugins: [ 'media' ],
    toolbar: 'media'
  };
  const hook = TinyHooks.bddSetupLight<Editor>({
    ...baseSettings,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const assertStructure = (
    editor: Editor,
    tag: string,
    classes: string[],
    attrs: Record<string, string | null>,
    styles: Record<string, string>,
    getChildren: ApproxStructure.Builder<StructAssert[]> = Fun.constant([])
  ) => {
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
            ...Obj.map(attrs, (value) => Type.isNull(value) ? str.none() : str.is(value))
          },
          styles: {
            height: str.none('should not have height style'),
            width: str.none('should not have width style'),
            ...Obj.map(styles, (value) => str.is(value))
          },
          children: getChildren(s, str, arr)
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

  it('TINY-7674: video with source child elements', () => {
    const editor = hook.editor();
    editor.setContent('<video class="test-class" style="height: 250px; width: 500px;"><source src="about:blank" type="video/mp4" /></video>');
    assertStructure(editor, 'video', [ 'test-class' ], { }, { width: '500px', height: '250px' }, (s, str) => [
      s.element('source', {
        attrs: {
          src: str.is('about:blank'),
          type: str.is('video/mp4')
        }
      })
    ]);
  });

  it('TINY-7674: audio with source child elements', () => {
    const editor = hook.editor();
    editor.setContent('<audio controls="controls"><source src="about:blank" type="audio/mp3"></audio>');
    assertStructure(editor, 'audio', [ ], { controls: 'controls' }, { }, (s, str) => [
      s.element('source', {
        attrs: {
          src: str.is('about:blank'),
          type: str.is('audio/mp3')
        }
      })
    ]);
  });

  context('Sandboxing iframes', () => {
    const initialIframeHtml = '<iframe src="about:blank"></iframe>';

    it('TINY-10348: sandbox_iframes: false should not have sandbox attribute in live embed', async () => {
      const editor = await McEditor.pFromSettings<Editor>({ ...baseSettings, sandbox_iframes: false });
      editor.setContent(initialIframeHtml);
      assertStructure(editor, 'iframe', [ ], { sandbox: null }, { });
    });

    it('TINY-10348: sandbox_iframes: true should havce sandbox attribute in live embed', async () => {
      const editor = await McEditor.pFromSettings<Editor>({ ...baseSettings, sandbox_iframes: true });
      editor.setContent(initialIframeHtml);
      assertStructure(editor, 'iframe', [ ], { sandbox: '' }, { });
    });
  });
});

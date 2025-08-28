import { ApproxStructure, StringAssert } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

type Alignment = 'left' | 'center' | 'right' | 'justify';

describe('browser.tinymce.core.fmt.MediaAlignTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const mediaApproxStructure = (tag: string, alignment: Alignment) => {
    const alignStyles = (str: ApproxStructure.StringApi): Record<string, StringAssert> => {
      if (alignment === 'left') {
        return { float: str.is('left') };
      } else if (alignment === 'center') {
        return { 'display': str.is('block'), 'margin-left': str.is('auto'), 'margin-right': str.is('auto') };
      } else if (alignment === 'right') {
        return { float: str.is('right') };
      } else {
        return {};
      }
    };

    return ApproxStructure.build((s, str) => s.element('body', {
      children: [
        s.element('p', {
          styles: alignment === 'justify' ? { 'text-align': str.is('justify') } : {},
          children: [
            s.element(tag, {
              styles: alignStyles(str)
            })
          ]
        }),
        s.theRest()
      ]
    }));
  };

  Arr.each([
    { type: 'video', content: '<p><video controls="controls"><source src="custom/video.mp4"></video></p>' },
    { type: 'audio', content: '<p><audio controls="controls"><source src="custom/audio.mp3"></audio></p>' },
  ], (test) => {
    const { type, content } = test;

    context(`${type} media`, () => {
      it('TINY-6633: Align left', () => {
        const editor = hook.editor();
        editor.setContent(content);
        TinySelections.select(editor, type, []);
        editor.formatter.apply('alignleft');
        TinyAssertions.assertContentStructure(editor, mediaApproxStructure(type, 'left'));
        editor.formatter.remove('alignleft');
        TinyAssertions.assertContent(editor, content);
      });

      it('TINY-6633: Align center', () => {
        const editor = hook.editor();
        editor.setContent(content);
        TinySelections.select(editor, type, []);
        editor.formatter.apply('aligncenter');
        TinyAssertions.assertContentStructure(editor, mediaApproxStructure(type, 'center'));
        editor.formatter.remove('aligncenter');
        TinyAssertions.assertContent(editor, content);
      });

      it('TINY-6633: Align right', () => {
        const editor = hook.editor();
        editor.setContent(content);
        TinySelections.select(editor, type, []);
        editor.formatter.apply('alignright');
        TinyAssertions.assertContentStructure(editor, mediaApproxStructure(type, 'right'));
        editor.formatter.remove('alignright');
        TinyAssertions.assertContent(editor, content);
      });
    });
  });
});

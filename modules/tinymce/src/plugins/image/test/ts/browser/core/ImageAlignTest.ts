import { ApproxStructure } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

type Alignment = 'left' | 'center' | 'right' | 'justify';

const figureImageApproxStructure = (alignment: Alignment, isSelectAll: boolean) => {
  const alignClasses = (arr: ApproxStructure.ArrayApi) => ({
    left: arr.has('align-left'),
    center: arr.has('align-center'),
    right: arr.has('align-right'),
    justify: arr.not('align-justify')
  });

  return ApproxStructure.build((s, str, arr) => s.element('body', {
    children: [
      ...isSelectAll ? [
        s.element('p', {
          styles: alignment === 'justify' ? { 'text-align': str.is('justify') } : {},
          children: [
            s.text(str.is('before'))
          ]
        }),
      ] : [],
      s.element('figure', {
        classes: [
          arr.has('image'),
          alignClasses(arr)[alignment]
        ],
        children: [
          s.element('img', {
            attrs: {
              src: str.is('image.png')
            }
          }),
          s.theRest()
        ]
      }),
      ...isSelectAll ? [
        s.element('p', {
          styles: alignment === 'justify' ? { 'text-align': str.is('justify') } : {},
          children: [
            s.text(str.is('after'))
          ]
        }),
      ] : [],
      s.theRest()
    ]
  }));
};

const imageApproxStructure = (alignment: Alignment, isSelectAll: boolean) => {
  const alignStyles = (str: ApproxStructure.StringApi) => ({
    left: { float: str.is('left') },
    center: { 'display': str.is('block'), 'margin-left': str.is('auto'), 'margin-right': str.is('auto') },
    right: { float: str.is('right') },
    justify: {}
  });

  return ApproxStructure.build((s, str) => s.element('body', {
    children: [
      ...isSelectAll ? [
        s.element('p', {
          styles: alignment === 'justify' ? { 'text-align': str.is('justify') } : {},
          children: [
            s.text(str.is('before'))
          ]
        }),
      ] : [],
      s.element('p', {
        styles: alignment === 'justify' ? { 'text-align': str.is('justify') } : {},
        children: [
          s.element('img', {
            attrs: {
              src: str.is('image.png')
            },
            styles: !isSelectAll ? alignStyles(str)[alignment] : {}
          })
        ]
      }),
      ...isSelectAll ? [
        s.element('p', {
          styles: alignment === 'justify' ? { 'text-align': str.is('justify') } : {},
          children: [
            s.text(str.is('after'))
          ]
        }),
      ] : [],
      s.theRest()
    ]
  }));
};

describe('browser.tinymce.plugins.image.ImageAlignTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'image',
    toolbar: 'image align alignleft aligncenter alignright alignjustify',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_caption: true
  }, [ Plugin ], true);

  const pCheckToolbarHighlighting = async (editor: Editor, alignment: Alignment, isFigure: boolean, isSelectAll: boolean) => {
    const ariaLabels = {
      left: 'Align left',
      center: 'Align center',
      right: 'Align right',
      justify: 'Justify'
    };
    const ariaLabel = ariaLabels[alignment];
    const otherLabels = Obj.values(Obj.filter(ariaLabels, (_, key) => key !== alignment));
    // Justify is the default for figures so it never gets highlighted
    const ariaPressed = isFigure && !isSelectAll && alignment === 'justify' ? 'false' : 'true';

    await TinyUiActions.pWaitForUi(editor, `button[aria-label="${ariaLabel}"][aria-pressed="${ariaPressed}"]:not(.tox-tbtn--select)`);
    await Arr.foldl(otherLabels, (p, label) => p.then(async () => {
      await TinyUiActions.pWaitForUi(editor, `button[aria-label="${label}"][aria-pressed="false"]:not(.tox-tbtn--select)`);
    }), Promise.resolve());
  };

  const pApplyAlignmentFromMenu = async (editor: Editor, alignment: Alignment) => {
    const ariaLabels = {
      left: 'Left',
      center: 'Center',
      right: 'Right',
      justify: 'Justify'
    };
    const ariaLabel = ariaLabels[alignment];

    TinyUiActions.clickOnToolbar(editor, `button[aria-label^="Align"].tox-tbtn--select`);
    await TinyUiActions.pWaitForUi(editor, `div[title="${ariaLabel}"]`);
    TinyUiActions.clickOnUi(editor, `div[title="${ariaLabel}"]`);
  };

  const pApplyAlignmentFromToolbar = (editor: Editor, alignment: Alignment) => {
    const ariaLabels = {
      left: 'Align left',
      center: 'Align center',
      right: 'Align right',
      justify: 'Justify'
    };
    const ariaLabel = ariaLabels[alignment];
    TinyUiActions.clickOnToolbar(editor, `button[aria-label="${ariaLabel}"]:not(.tox-tbtn--select)`);
    return Promise.resolve();
  };

  beforeEach(() => {
    hook.editor().focus();
  });

  const testConsecutiveAlignments = (label: string, pAlignImage: (editor: Editor, alignment: Alignment) => Promise<void>, alignments: Alignment[]) => {
    context(label, () => {
      const pAlignmentSteps = (editor: Editor, isFigure: boolean, isSelectAll: boolean) => Arr.foldl(alignments, (p, alignment) => p.then(async () => {
        await pAlignImage(editor, alignment);
        await pCheckToolbarHighlighting(editor, alignment, isFigure, isSelectAll);
        TinyAssertions.assertContentStructure(editor, isFigure ? figureImageApproxStructure(alignment, isSelectAll) : imageApproxStructure(alignment, isSelectAll));
      }), Promise.resolve());

      it('TINY-4507: directly select image and align', async () => {
        const editor = hook.editor();
        editor.setContent('<p><img src="image.png" /></p>');
        TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
        await pAlignmentSteps(editor, false, false);
      });

      it('TINY-4507: directly select figure and align', async () => {
        const editor = hook.editor();
        editor.setContent('<figure class="image"><img src="image.png" /><figcaption>Caption</figcaption></figure>');
        TinySelections.setSelection(editor, [], 1, [], 2);
        await pAlignmentSteps(editor, true, false);
      });

      it('TINY-8905: select all content with image and align', async () => {
        const editor = hook.editor();
        editor.setContent('<p>before</p><p><img src="image.png" /></p><p>after</p>');
        editor.execCommand('SelectAll');
        await pAlignmentSteps(editor, false, true);
      });

      it('TINY-8905: select all content with figure and align', async () => {
        const editor = hook.editor();
        editor.setContent('<p>before</p><figure class="image"><img src="image.png" /><figcaption>Caption</figcaption></figure><p>after</p>');
        editor.execCommand('SelectAll');
        await pAlignmentSteps(editor, true, true);
      });
    });
  };

  Arr.each([
    { label: 'Testing image alignment using the toolbar', pAlignImage: pApplyAlignmentFromToolbar },
    { label: 'Testing image alignment using the menu', pAlignImage: pApplyAlignmentFromMenu }
  ], (test) => {
    context(test.label, () => {
      testConsecutiveAlignments('Align: left -> center -> left', test.pAlignImage, [ 'left', 'center', 'left' ]);
      testConsecutiveAlignments('Align: left -> right -> left', test.pAlignImage, [ 'left', 'right', 'left' ]);
      testConsecutiveAlignments('Align: left -> justify -> left', test.pAlignImage, [ 'left', 'justify', 'left' ]);
      testConsecutiveAlignments('Align: right -> center -> right', test.pAlignImage, [ 'right', 'center', 'right' ]);
      testConsecutiveAlignments('Align: right -> justify -> right', test.pAlignImage, [ 'right', 'justify', 'right' ]);
      testConsecutiveAlignments('Align: center -> justify -> center', test.pAlignImage, [ 'center', 'justify', 'center' ]);
      testConsecutiveAlignments('Align: left -> center -> right -> justify', test.pAlignImage, [ 'left', 'center', 'right', 'justify' ]);
    });
  });
});

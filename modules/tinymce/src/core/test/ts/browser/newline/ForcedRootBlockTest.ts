import { ApproxStructure, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Obj } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.newline.ForcedRootBlockTest', (success, failure) => {
  Theme();

  const bookmarkSpan = '<span data-mce-type="bookmark" id="mce_2_start" data-mce-style="overflow:hidden;line-height:0px" style="overflow:hidden;line-height:0px"></span>';
  const forcedRootBlock = 'p';
  const forcedRootBlockAttrs = { style: 'color: red;', class: 'abc def' };
  const baseExpectedHTML = (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style}">${innerHTML}</p>`;

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const sAssertNewLine = (label: string, rootBlock: string, rootBlockAttrs: Record<string, string>, initalHTML: string, expectedHTML: (innerHTML: string) => string) =>
      Logger.t(label, GeneralSteps.sequence([
        Logger.t('Insert block before', GeneralSteps.sequence([
          tinyApis.sSetContent(initalHTML),
          tinyApis.sSetCursor([0, 0], 0),
          tinyApis.sExecCommand('mceInsertNewLine'),
          tinyApis.sAssertContentStructure(
            ApproxStructure.build((s, str, arr) => {
              return s.element('body', {
                children: [
                  ApproxStructure.fromHtml(expectedHTML('<br data-mce-bogus="1">')),
                  s.element(rootBlock, {})
                ]
              });
            })
          ),
          tinyApis.sAssertSelection([1, 0], 0, [1, 0], 0)
        ])),
        Logger.t('Split block in the middle', GeneralSteps.sequence([
          tinyApis.sSetContent(initalHTML),
          tinyApis.sSetCursor([0, 0], 1),
          tinyApis.sExecCommand('mceInsertNewLine'),
          tinyApis.sAssertContentStructure(
            ApproxStructure.build((s, str, arr) => {
              return s.element('body', {
                children: [
                  s.element(rootBlock, {}),
                  ApproxStructure.fromHtml(expectedHTML('b'))
                ]
              });
            })
          ),
          tinyApis.sAssertSelection([1, 0], 0, [1, 0], 0)
        ])),
        Logger.t('Insert block after', GeneralSteps.sequence([
          tinyApis.sSetContent(initalHTML),
          tinyApis.sSetCursor([0, 0], 2),
          tinyApis.sExecCommand('mceInsertNewLine'),
          tinyApis.sAssertContentStructure(
            ApproxStructure.build((s, str, arr) => {
              return s.element('body', {
                children: [
                  s.element(rootBlock, {}),
                  ApproxStructure.fromHtml(expectedHTML('<br data-mce-bogus="1">')),
                ]
              });
            })
          ),
          tinyApis.sAssertSelection([1], 0, [1], 0)
        ])),
        Logger.t('Insert block after bookmark', GeneralSteps.sequence([
          tinyApis.sSetRawContent(`<${rootBlock}>${bookmarkSpan}<br data-mce-bogus="1"></${rootBlock}>`),
          tinyApis.sSetCursor([0], 1),
          tinyApis.sExecCommand('mceInsertNewLine'),
          tinyApis.sAssertContentStructure(
            ApproxStructure.build((s, str) => {
              return s.element('body', {
                children: [
                  s.element(rootBlock, {
                    children: [
                      ApproxStructure.fromHtml(bookmarkSpan),
                      s.element('br', {
                        attrs: {
                          'data-mce-bogus': str.is('1')
                        }
                      })
                    ]
                  }),
                  s.element(rootBlock, {
                    attrs: Obj.map(rootBlockAttrs, (val) => str.is(val)),
                    children: [
                      s.element('br', {
                        attrs: {
                          'data-mce-bogus': str.is('1')
                        }
                      })
                    ]
                  })
                ]
              });
            })),
          tinyApis.sAssertSelection([1], 0, [1], 0)
        ]))
      ]));

    Pipeline.async({}, [
      tinyApis.sFocus(),
      sAssertNewLine('paragraph, plain', 'p', forcedRootBlockAttrs, `<p>ab</p>`, baseExpectedHTML),
      sAssertNewLine('paragraph, same attributes as forced_root_block_attrs', 'p', forcedRootBlockAttrs, `<p class=${forcedRootBlockAttrs.class} style=${forcedRootBlockAttrs.style}>ab</p>`, baseExpectedHTML),
      sAssertNewLine('paragraph, only style attribute', 'p', forcedRootBlockAttrs, `<p style=${forcedRootBlockAttrs.style}>ab</p>`, baseExpectedHTML),
      sAssertNewLine('paragraph, only class attribute', 'p', forcedRootBlockAttrs, `<p class=${forcedRootBlockAttrs.class}>ab</p>`, baseExpectedHTML),
      sAssertNewLine(
        'paragraph, additional attribute',
        'p',
        forcedRootBlockAttrs,
        `<p data-test="1">ab</p>`,
        (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style}" data-test="1">${innerHTML}</p>`
      ),
      sAssertNewLine(
        'paragraph, custom class attribute',
        'p',
        forcedRootBlockAttrs,
        `<p class="c1">ab</p>`,
        (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class + ' c1'}" style="${forcedRootBlockAttrs.style}">${innerHTML}</p>`
      ),
      sAssertNewLine(
        'paragraph, custom style attribute',
        'p',
        forcedRootBlockAttrs,
        `<p style="padding-left: 40px;">ab</p>`,
        (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style + ' padding-left: 40px;'}">${innerHTML}</p>`
      ),
      tinyApis.sSetSetting('forced_root_block_attrs', { ...forcedRootBlockAttrs, 'data-test': '1' }),
      sAssertNewLine(
        'paragraph, additional attribute in forced_root_block_attrs',
        'p',
        { ...forcedRootBlockAttrs, 'data-test': '1' },
        `<p>ab</p>`,
        (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style}" data-test="1">${innerHTML}</p>`
      ),
      sAssertNewLine(
        'paragraph, common attribute',
        'p',
        { ...forcedRootBlockAttrs, 'data-test': '1' },
        `<p data-test="0">ab</p>`,
        (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style}" data-test="1">${innerHTML}</p>`
      ),
      tinyApis.sSetSetting('forced_root_block_atrrs', forcedRootBlockAttrs),
      tinyApis.sSetSetting('forced_root_block', 'div'),
      sAssertNewLine(
        'div, plain',
        'div',
        forcedRootBlockAttrs,
        `<div>ab</div>`,
        (innerHTML: string) => `<div class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style}">${innerHTML}</div>`
      )
    ], onSuccess, onFailure);
  }, {
    forced_root_block: forcedRootBlock,
    forced_root_block_attrs: forcedRootBlockAttrs,
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});

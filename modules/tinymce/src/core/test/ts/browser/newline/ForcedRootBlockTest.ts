import { ApproxStructure, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Obj } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import InsertNewLine from 'tinymce/core/newline/InsertNewLine';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.newline.ForcedRootBlockTest', (success, failure) => {
  Theme();

  const bookmarkSpan = '<span data-mce-type="bookmark" id="mce_2_start" data-mce-style="overflow:hidden;line-height:0px" style="overflow:hidden;line-height:0px"></span>';
  const forcedRootBlock = 'p';
  const forcedRootBlockAttrs = { style: 'color: red;', class: 'abc def' };

  const baseExpectedHTML = (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style}">${innerHTML}</p>`;

  const sInsertNewline = (editor: Editor, args) => {
    return Step.sync(function () {
      InsertNewLine.insert(editor, args);
    });
  };

  TinyLoader.setupLight(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    const sAssertNewLine = (label: string, rootBlock: string, initalHTML: string, expectedHTML: (innerHTML: string) => string) => Logger.t(label, GeneralSteps.sequence([
      Logger.t('Insert block before', GeneralSteps.sequence([
        tinyApis.sSetContent(initalHTML),
        tinyApis.sSetCursor([0, 0], 0),
        sInsertNewline(editor, {}),
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
        sInsertNewline(editor, {}),
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
        sInsertNewline(editor, {}),
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
        sInsertNewline(editor, {}),
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
                  attrs: Obj.map(editor.settings.forced_root_block_attrs, (val) => str.is(val)),
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
      sAssertNewLine('paragraph, plain', 'p', `<p>ab</p>`, baseExpectedHTML),
      sAssertNewLine('paragraph, same attributes as forced_root_block_attrs', 'p', `<p class=${forcedRootBlockAttrs.class} style=${forcedRootBlockAttrs.style}>ab</p>`, baseExpectedHTML),
      sAssertNewLine('paragraph, only style attribute', 'p', `<p style=${forcedRootBlockAttrs.style}>ab</p>`, baseExpectedHTML),
      sAssertNewLine('paragraph, only class attribute', 'p', `<p class=${forcedRootBlockAttrs.class}>ab</p>`, baseExpectedHTML),
      sAssertNewLine(
        'paragraph, additional attribute',
        'p',
        `<p data-test="1">ab</p>`,
        (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style}" data-test="1">${innerHTML}</p>`
      ),
      sAssertNewLine(
        'paragraph, custom class attribute',
        'p',
        `<p class="c1">ab</p>`,
        (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class + ' c1'}" style="${forcedRootBlockAttrs.style}">${innerHTML}</p>`
      ),
      sAssertNewLine(
        'paragraph, custom style attribute',
        'p',
        `<p style="padding-left: 40px;">ab</p>`,
        (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style + ' padding-left: 40px;'}">${innerHTML}</p>`
      ),
      tinyApis.sSetSetting('forced_root_block_attrs', { ...forcedRootBlockAttrs, 'data-test': '1' }),
      sAssertNewLine(
        'paragraph, additional attribute in forced_root_block_attrs',
        'p',
        `<p>ab</p>`,
        (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style}" data-test="1">${innerHTML}</p>`
      ),
      sAssertNewLine(
        'paragraph, common attribute',
        'p',
        `<p data-test="0">ab</p>`,
        (innerHTML: string) => `<p class="${forcedRootBlockAttrs.class}" style="${forcedRootBlockAttrs.style}" data-test="1">${innerHTML}</p>`
      ),
      tinyApis.sSetSetting('forced_root_block_atrrs', forcedRootBlockAttrs),
      tinyApis.sSetSetting('forced_root_block', 'div'),
      sAssertNewLine(
        'div, plain',
        'div',
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

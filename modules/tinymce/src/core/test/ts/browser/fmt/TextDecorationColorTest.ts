import { ApproxStructure, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Theme from 'tinymce/themes/silver/Theme';

type Selection = { startPath: number[]; sOffset: number; finishPath: number[]; fOffset: number };
type Text = { before: string; selected: string; after: string };

UnitTest.asynctest('browser.tinymce.core.fmt.TextDecorationColorTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const textColorHex = '#bfedd2';

    const applyForecolor = () => Log.stepsAsStep('TINY-4757', 'Apply forecolor to text', [
      tinyUi.sClickOnToolbar('click forecolor', '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron'),
      tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
      tinyUi.sClickOnUi('click color', `div[data-mce-color="${textColorHex.toUpperCase()}"]`)
    ]);

    const removeForecolor = () => Log.stepsAsStep('TINY-4757', 'Remove forecolor from text', [
      tinyUi.sClickOnToolbar('click forecolor', '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron'),
      tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
      tinyUi.sClickOnUi('click remove color', '.tox-swatch--remove')
    ]);

    const applyCustomFormat = (format: string) => Step.sync(() => editor.formatter.apply(format));
    const removeCustomFormat = (format: string) => Step.sync(() => editor.formatter.remove(format));

    const toggleInlineStyle = (style: string) => tinyUi.sClickOnToolbar(`click ${style}`, `[aria-label="${style}"]`);

    const sAssertEditorContent = (content: string) => {
      const contentStructure = ApproxStructure.build((s) => s.element('body', {
        children: [
          ApproxStructure.fromHtml(content)
        ]
      }));
      // IE11 and approx structure do not work properly with colors
      // Cannot just use sAssertContent for other browsers as style properties can be in a different order
      return Env.ie === 11 ? tinyApis.sAssertContent(content) : tinyApis.sAssertContentStructure(contentStructure);
    };

    const sMergeForecolorAndTextDecoration = (toolbarLabel: string, textDecoration: string, text: Text, selection: Selection) => {
      const startText = `<p>${text.before + text.selected + text.after}</p>`;
      const sSelectText = () => tinyApis.sSetSelection(selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset);

      return Log.stepsAsStep('TINY-4757', `Merge forecolor and ${toolbarLabel} with text: ${text.before + text.selected + text.after}`, [
        Log.stepsAsStep('TINY-4757', 'Apply forecolor then text-decoration then unapply them', [
          tinyApis.sSetContent(startText),
          tinyApis.sFocus(),
          sSelectText(),
          applyForecolor(),
          sAssertEditorContent(`<p>${text.before}<span style="color: ${textColorHex};">${text.selected}</span>${text.after}</p>`),
          toggleInlineStyle(toolbarLabel),
          // TODO: This is different to test step below - need to investigate this in the future
          sAssertEditorContent(`<p>${text.before}<span style="text-decoration: ${textDecoration};"><span style="color: ${textColorHex}; text-decoration: ${textDecoration};">${text.selected}</span></span>${text.after}</p>`),
          toggleInlineStyle(toolbarLabel),
          sAssertEditorContent(`<p>${text.before}<span style="color: ${textColorHex};">${text.selected}</span>${text.after}</p>`),
          removeForecolor(),
          sAssertEditorContent(startText)
        ]),
        Log.stepsAsStep('TINY-4757', 'Apply text-decoration then forecolor then unapply them', [
          tinyApis.sSetContent(startText),
          tinyApis.sFocus(),
          sSelectText(),
          toggleInlineStyle(toolbarLabel),
          sAssertEditorContent(`<p>${text.before}<span style="text-decoration: ${textDecoration};">${text.selected}</span>${text.after}</p>`),
          applyForecolor(),
          sAssertEditorContent(`<p>${text.before}<span style="color: ${textColorHex}; text-decoration: ${textDecoration};">${text.selected}</span>${text.after}</p>`),
          removeForecolor(),
          sAssertEditorContent(`<p>${text.before}<span style="text-decoration: ${textDecoration};">${text.selected}</span>${text.after}</p>`),
          toggleInlineStyle(toolbarLabel),
          sAssertEditorContent(startText)
        ]),
        Log.stepsAsStep('TINY-4757', 'Apply bold, forecolor then text-decoration then unapply them', [
          tinyApis.sSetContent(startText),
          tinyApis.sFocus(),
          sSelectText(),
          toggleInlineStyle('Bold'),
          sAssertEditorContent(`<p>${text.before}<strong>${text.selected}</strong>${text.after}</p>`),
          applyForecolor(),
          sAssertEditorContent(`<p>${text.before}<span style="color: ${textColorHex};"><strong>${text.selected}</strong></span>${text.after}</p>`),
          toggleInlineStyle(toolbarLabel),
          // TODO: This is different to test step below - need to investigate this in the future
          sAssertEditorContent(`<p>${text.before}<span style="text-decoration: ${textDecoration};"><span style="color: ${textColorHex}; text-decoration: ${textDecoration};"><strong>${text.selected}</strong></span></span>${text.after}</p>`),
          toggleInlineStyle(toolbarLabel),
          sAssertEditorContent(`<p>${text.before}<span style="color: ${textColorHex};"><strong>${text.selected}</strong></span>${text.after}</p>`),
          removeForecolor(),
          sAssertEditorContent(`<p>${text.before}<strong>${text.selected}</strong>${text.after}</p>`),
          toggleInlineStyle('Bold'),
          sAssertEditorContent(startText)
        ]),
        Log.stepsAsStep('TINY-4757', 'Apply bold, text-decoration then forecolor then unapply them', [
          tinyApis.sSetContent(startText),
          tinyApis.sFocus(),
          sSelectText(),
          toggleInlineStyle('Bold'),
          sAssertEditorContent(`<p>${text.before}<strong>${text.selected}</strong>${text.after}</p>`),
          toggleInlineStyle(toolbarLabel),
          sAssertEditorContent(`<p>${text.before}<span style="text-decoration: ${textDecoration};"><strong>${text.selected}</strong></span>${text.after}</p>`),
          applyForecolor(),
          sAssertEditorContent(`<p>${text.before}<span style="color: ${textColorHex}; text-decoration: ${textDecoration};"><strong>${text.selected}</strong></span>${text.after}</p>`),
          removeForecolor(),
          sAssertEditorContent(`<p>${text.before}<span style="text-decoration: ${textDecoration};"><strong>${text.selected}</strong></span>${text.after}</p>`),
          toggleInlineStyle(toolbarLabel),
          sAssertEditorContent(`<p>${text.before}<strong>${text.selected}</strong>${text.after}</p>`),
          toggleInlineStyle('Bold'),
          sAssertEditorContent(startText)
        ])
      ]);
    };

    const sMergeForecolorAndTextDecorations = (text: Text, selection: Selection) => {
      const startText = `<p>${text.before + text.selected + text.after}</p>`;
      const sSelectText = () => tinyApis.sSetSelection(selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset);

      return Log.stepsAsStep('TINY-4757', `Merge forecolor and text decorations with text: ${text.before + text.selected + text.after}`, [
        Log.stepsAsStep('TINY-4757', 'Apply forecolor and custom format then unapply them', [
          tinyApis.sSetContent(startText),
          tinyApis.sFocus(),
          sSelectText(),
          applyForecolor(),
          sAssertEditorContent(`<p>${text.before}<span style="color: ${textColorHex};">${text.selected}</span>${text.after}</p>`),
          applyCustomFormat('custom_format'),
          sAssertEditorContent(`<p>${text.before}<span class="abc" style="color: ${textColorHex}; text-decoration: underline;">${text.selected}</span>${text.after}</p>`),
          removeCustomFormat('custom_format'),
          sAssertEditorContent(`<p>${text.before}<span style="color: ${textColorHex};">${text.selected}</span>${text.after}</p>`),
          removeForecolor(),
          sAssertEditorContent(startText)
        ]),
        Log.stepsAsStep('TINY-4757', 'Apply custom format and forecolor then unapply them', [
          tinyApis.sSetContent(startText),
          tinyApis.sFocus(),
          sSelectText(),
          applyCustomFormat('custom_format'),
          sAssertEditorContent(`<p>${text.before}<span class="abc" style="text-decoration: underline;">${text.selected}</span>${text.after}</p>`),
          applyForecolor(),
          sAssertEditorContent(`<p>${text.before}<span class="abc" style="color: ${textColorHex}; text-decoration: underline;">${text.selected}</span>${text.after}</p>`),
          removeForecolor(),
          sAssertEditorContent(`<p>${text.before}<span class="abc" style="text-decoration: underline;">${text.selected}</span>${text.after}</p>`),
          removeCustomFormat('custom_format'),
          sAssertEditorContent(startText)
        ])
      ]);
    };

    const sTestMergeForecolorAndTextDecoration = (label: string, text: Text, selection: Selection) =>
      Log.stepsAsStep('TINY-4757', label, [
        sMergeForecolorAndTextDecoration('Underline', 'underline', text, selection),
        sMergeForecolorAndTextDecoration('Strikethrough', 'line-through', text, selection),
        sMergeForecolorAndTextDecorations(text, selection)
      ]);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      sTestMergeForecolorAndTextDecoration('Collpased selection', { before: '', selected: 'abc', after: '' }, { startPath: [ 0, 0 ], sOffset: 1, finishPath: [ 0, 0 ], fOffset: 1 }),
      sTestMergeForecolorAndTextDecoration('Ranged selection: whole word', { before: '', selected: 'abc', after: ' def' }, { startPath: [ 0, 0 ], sOffset: 0, finishPath: [ 0, 0 ], fOffset: 'abc'.length }),
      sTestMergeForecolorAndTextDecoration('Ranged selection: part of word', { before: 'a', selected: 'b', after: 'c def' }, { startPath: [ 0, 0 ], sOffset: 1, finishPath: [ 0, 0 ], fOffset: 2 }),
      sTestMergeForecolorAndTextDecoration('Ranged selection: multiple words', { before: '', selected: 'abc def', after: '' }, { startPath: [ 0, 0 ], sOffset: 0, finishPath: [ 0, 0 ], fOffset: 'abc def'.length })
    ], onSuccess, onFailure);
  }, {
    plugins: '',
    toolbar: 'forecolor backcolor | bold italic underline strikethrough',
    formats: {
      custom_format: { inline: 'span', classes: 'abc', styles: { textDecoration: 'underline' }}
    },
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});

import { Pipeline, Log, Step } from '@ephox/agar';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.core.fmt.TextDecorationColorTest', function (success, failure) {

  Theme();

  // TODO: Add test step for custom formatter
  // TODO: Need tests for ranged selections including over multiple words

  TinyLoader.setupLight(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const applyForecolor = () => Log.stepsAsStep('TBA', 'Apply forecolor to text', [
      tinyUi.sClickOnToolbar('click forecolor', '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron'),
      tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
      tinyUi.sClickOnUi('click color', 'div[data-mce-color="#BFEDD2"]')
    ]);

    const removeForecolor = () => Log.stepsAsStep('TBA', 'Apply forecolor to text', [
      tinyUi.sClickOnToolbar('click forecolor', '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron'),
      tinyUi.sWaitForUi('wait for color swatch to open', '.tox-swatches'),
      tinyUi.sClickOnUi('click remove color', '.tox-swatch--remove'),
    ]);

    const applyCustomFormat = (format: string) => Step.sync(() => editor.formatter.apply(format));
    const removeCustomFormat = (format: string) => Step.sync(() => editor.formatter.remove(format));

    const toggleInlineStyle = (style: string) => tinyUi.sClickOnToolbar(`click ${style}`, `[aria-label="${style}"]`);

    type Selection = {startPath: number[], sOffset: number, finishPath: number[], fOffset: number};

    const sMergeForecolorAndTextDecoration = (toolbarLabel: string, textDecoration: string) => (text: {bText: string, mText: string, aText: string}, selection: Selection) =>
      Log.stepsAsStep('', `Merge forecolor and ${toolbarLabel} with text: ${text.bText + text.mText + text.aText}`, [
        Log.stepsAsStep('TBA', 'Apply forecolor then text-decoration then unapply them', [
          tinyApis.sSetContent(`<p>${text.bText + text.mText + text.aText}</p>`),
          tinyApis.sFocus(),
          tinyApis.sSetSelection(selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset),
          applyForecolor(),
          tinyApis.sAssertContent(`<p>${text.bText}<span style="color: #bfedd2;">${text.mText}</span>${text.aText}</p>`),
          toggleInlineStyle(toolbarLabel),
          tinyApis.sAssertContent(`<p>${text.bText}<span style="text-decoration: ${textDecoration};"><span style="color: #bfedd2; text-decoration: ${textDecoration};">${text.mText}</span></span>${text.aText}</p>`),
          toggleInlineStyle(toolbarLabel),
          tinyApis.sAssertContent(`<p>${text.bText}<span style="color: #bfedd2;">${text.mText}</span>${text.aText}</p>`),
          removeForecolor(),
          tinyApis.sAssertContent(`<p>${text.bText + text.mText + text.aText}</p>`),
        ]),
        Log.stepsAsStep('TBA', 'Apply text-decoration then forecolor then unapply them', [
          tinyApis.sSetContent(`<p>${text.bText + text.mText + text.aText}</p>`),
          tinyApis.sFocus(),
          tinyApis.sSetSelection(selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset),
          toggleInlineStyle(toolbarLabel),
          tinyApis.sAssertContent(`<p>${text.bText}<span style="text-decoration: ${textDecoration};">${text.mText}</span>${text.aText}</p>`),
          applyForecolor(),
          // This is different to above - need to investigate this
          // Probably should use Structure builder
          tinyApis.sAssertContent(`<p>${text.bText}<span style="text-decoration: ${textDecoration}; color: #bfedd2;">${text.mText}</span>${text.aText}</p>`),
          removeForecolor(),
          tinyApis.sAssertContent(`<p>${text.bText}<span style="text-decoration: ${textDecoration};">${text.mText}</span>${text.aText}</p>`),
          toggleInlineStyle(toolbarLabel),
          tinyApis.sAssertContent(`<p>${text.bText + text.mText + text.aText}</p>`),
        ]),
        Log.stepsAsStep('TBA', 'Apply forecolor and custom format then unapply them', [
          tinyApis.sSetContent(`<p>${text.bText + text.mText + text.aText}</p>`),
          tinyApis.sFocus(),
          tinyApis.sSetSelection(selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset),
          applyForecolor(),
          tinyApis.sAssertContent(`<p>${text.bText}<span style="color: #bfedd2;">${text.mText}</span>${text.aText}</p>`),
          applyCustomFormat('custom_format'),
          tinyApis.sAssertContent(`<p>${text.bText}<span class="abc" style="color: #bfedd2; text-decoration: underline;">${text.mText}</span>${text.aText}</p>`),
          removeCustomFormat('custom_format'),
          tinyApis.sAssertContent(`<p>${text.bText}<span style="color: #bfedd2;">${text.mText}</span>${text.aText}</p>`),
          removeForecolor(),
          tinyApis.sAssertContent(`<p>${text.bText + text.mText + text.aText}</p>`),
        ]),
        // Apply custom format then forecolor
        Log.stepsAsStep('TBA', 'Apply custom format and forecolor then unapply them', [
          tinyApis.sSetContent(`<p>${text.bText + text.mText + text.aText}</p>`),
          tinyApis.sFocus(),
          tinyApis.sSetSelection(selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset),
          applyCustomFormat('custom_format'),
          tinyApis.sAssertContent(`<p>${text.bText}<span class="abc" style="text-decoration: underline;">${text.mText}</span>${text.aText}</p>`),
          applyForecolor(),
          tinyApis.sAssertContent(`<p>${text.bText}<span class="abc" style="text-decoration: underline; color: #bfedd2;">${text.mText}</span>${text.aText}</p>`),
          removeForecolor(),
          tinyApis.sAssertContent(`<p>${text.bText}<span class="abc" style="text-decoration: underline;">${text.mText}</span>${text.aText}</p>`),
          removeCustomFormat('custom_format'),
          tinyApis.sAssertContent(`<p>${text.bText + text.mText + text.aText}</p>`),
        ]),
      ]);

    const sMergeForecolorAndUnderline = sMergeForecolorAndTextDecoration('Underline', 'underline');
    const sMergeForecolorAndStrikethrough = sMergeForecolorAndTextDecoration('Strikethrough', 'line-through');

    Pipeline.async({}, [
      // Collapsed selections
      sMergeForecolorAndUnderline({bText: '', mText: 'abc', aText: ''}, {startPath: [0, 0], sOffset: 1, finishPath: [0, 0], fOffset: 1}),
      sMergeForecolorAndStrikethrough({bText: '', mText: 'abc', aText: ''}, {startPath: [0, 0], sOffset: 1, finishPath: [0, 0], fOffset: 1}),
      // Ranged selections (single word)
      sMergeForecolorAndUnderline({bText: '', mText: 'abc', aText: ' def'}, {startPath: [0, 0], sOffset: 0, finishPath: [0, 0], fOffset: 'abc'.length}),
      sMergeForecolorAndStrikethrough({bText: '', mText: 'abc', aText: ' def'}, {startPath: [0, 0], sOffset: 0, finishPath: [0, 0], fOffset: 'abc'.length}),
      // Ranged selections (part of word)
      sMergeForecolorAndUnderline({bText: 'a', mText: 'b', aText: 'c def'}, {startPath: [0, 0], sOffset: 1, finishPath: [0, 0], fOffset: 2}),
      sMergeForecolorAndStrikethrough({bText: 'a', mText: 'b', aText: 'c def'}, {startPath: [0, 0], sOffset: 1, finishPath: [0, 0], fOffset: 2}),
      // Ranged selections (multiple words)
      sMergeForecolorAndUnderline({bText: '', mText: 'abc def', aText: ''}, {startPath: [0, 0], sOffset: 0, finishPath: [0, 0], fOffset: 'abc def'.length}),
      sMergeForecolorAndStrikethrough({bText: '', mText: 'abc def', aText: ''}, {startPath: [0, 0], sOffset: 0, finishPath: [0, 0], fOffset: 'abc def'.length}),
    ], onSuccess, onFailure);
  }, {
    plugins: '',
    toolbar: 'forecolor backcolor | bold italic underline strikethrough',
    formats: {
      custom_format: { inline: 'span', classes: 'abc', styles: { 'text-decoration': 'underline' } }
    },
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});

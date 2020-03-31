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

    const sMergeForecolorAndTextDecoration = (toolbarLabel: string, textDecoration: string, selectedText: string, restText: string, selection: Selection) =>
      Log.stepsAsStep('', `Merge forecolor and ${toolbarLabel} with text: ${selectedText + restText}`, [
        Log.stepsAsStep('TBA', 'Apply forecolor then text-decoration then unapply them', [
          tinyApis.sSetContent(`<p>${selectedText + restText}</p>`),
          tinyApis.sFocus(),
          tinyApis.sSetSelection(selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset),
          applyForecolor(),
          tinyApis.sAssertContent(`<p><span style="color: #bfedd2;">${selectedText}</span>${restText}</p>`),
          toggleInlineStyle(toolbarLabel),
          tinyApis.sAssertContent(`<p><span style="text-decoration: ${textDecoration};"><span style="color: #bfedd2; text-decoration: ${textDecoration};">${selectedText}</span></span>${restText}</p>`),
          toggleInlineStyle(toolbarLabel),
          tinyApis.sAssertContent(`<p><span style="color: #bfedd2;">${selectedText}</span>${restText}</p>`),
          removeForecolor(),
          tinyApis.sAssertContent(`<p>${selectedText + restText}</p>`),
        ]),
        Log.stepsAsStep('TBA', 'Apply text-decoration then forecolor then unapply them', [
          tinyApis.sSetContent(`<p>${selectedText + restText}</p>`),
          tinyApis.sFocus(),
          tinyApis.sSetSelection(selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset),
          toggleInlineStyle(toolbarLabel),
          tinyApis.sAssertContent(`<p><span style="text-decoration: ${textDecoration};">${selectedText}</span>${restText}</p>`),
          applyForecolor(),
          // This is different to above - need to investigate this
          // Probably should use Structure builder
          tinyApis.sAssertContent(`<p><span style="text-decoration: ${textDecoration}; color: #bfedd2;">${selectedText}</span>${restText}</p>`),
          removeForecolor(),
          tinyApis.sAssertContent(`<p><span style="text-decoration: ${textDecoration};">${selectedText}</span>${restText}</p>`),
          toggleInlineStyle(toolbarLabel),
          tinyApis.sSetContent(`<p>${selectedText + restText}</p>`),
        ]),
        Log.stepsAsStep('TBA', 'Apply forecolor and custom format then unapply them', [
          tinyApis.sSetContent(`<p>${selectedText + restText}</p>`),
          tinyApis.sFocus(),
          tinyApis.sSetSelection(selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset),
          applyForecolor(),
          tinyApis.sAssertContent(`<p><span style="color: #bfedd2;">${selectedText}</span>${restText}</p>`),
          applyCustomFormat('custom_format'),
          tinyApis.sAssertContent(`<p><span class="abc" style="color: #bfedd2; text-decoration: underline;">${selectedText}</span>${restText}</p>`),
          removeCustomFormat('custom_format'),
          tinyApis.sAssertContent(`<p><span style="color: #bfedd2;">${selectedText}</span>${restText}</p>`),
          removeForecolor(),
          tinyApis.sSetContent(`<p>${selectedText + restText}</p>`),
        ]),
        // Apply custom format then forecolor
        Log.stepsAsStep('TBA', 'Apply custom format and forecolor then unapply them', [
          tinyApis.sSetContent(`<p>${selectedText + restText}</p>`),
          tinyApis.sFocus(),
          tinyApis.sSetSelection(selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset),
          applyCustomFormat('custom_format'),
          tinyApis.sAssertContent(`<p><span class="abc" style="text-decoration: underline;">${selectedText}</span>${restText}</p>`),
          applyForecolor(),
          tinyApis.sAssertContent(`<p><span class="abc" style="text-decoration: underline; color: #bfedd2;">${selectedText}</span>${restText}</p>`),
          removeForecolor(),
          tinyApis.sAssertContent(`<p><span class="abc" style="text-decoration: underline;">${selectedText}</span>${restText}</p>`),
          removeCustomFormat('custom_format'),
          tinyApis.sSetContent(`<p>${selectedText + restText}</p>`),
        ]),
      ]);

    Pipeline.async({}, [
      // Collapsed selections
      sMergeForecolorAndTextDecoration('Underline', 'underline', 'abc', '', {startPath: [0, 0], sOffset: 1, finishPath: [0, 0], fOffset: 1}),
      sMergeForecolorAndTextDecoration('Strikethrough', 'line-through', 'abc', '', {startPath: [0, 0], sOffset: 1, finishPath: [0, 0], fOffset: 1}),
      // Ranged selections (single word)
      sMergeForecolorAndTextDecoration('Underline', 'underline', 'abc', ' def', {startPath: [0, 0], sOffset: 0, finishPath: [0, 0], fOffset: 'abc'.length}),
      sMergeForecolorAndTextDecoration('Strikethrough', 'line-through', 'abc', ' def', {startPath: [0, 0], sOffset: 0, finishPath: [0, 0], fOffset: 'abc'.length}),
      // Ranged selections (multiple words)
      sMergeForecolorAndTextDecoration('Underline', 'underline', 'abc def', '', {startPath: [0, 0], sOffset: 0, finishPath: [0, 0], fOffset: 'abc def'.length}),
      sMergeForecolorAndTextDecoration('Strikethrough', 'line-through', 'abc def', '', {startPath: [0, 0], sOffset: 0, finishPath: [0, 0], fOffset: 'abc def'.length}),
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

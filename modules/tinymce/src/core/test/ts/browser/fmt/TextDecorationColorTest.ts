import { Pipeline, Log, Step } from '@ephox/agar';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { UnitTest } from '@ephox/bedrock-client';
import Theme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';

type Selection = {startPath: number[], sOffset: number, finishPath: number[], fOffset: number};
type Text = {before: string, selected: string, after: string};

UnitTest.asynctest('browser.tinymce.core.fmt.TextDecorationColorTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
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

    const sMergeForecolorAndTextDecoration = (toolbarLabel: string, textDecoration: string) => (text: Text, selection: Selection) =>
      Log.stepsAsStep('TBA', `Merge forecolor and ${toolbarLabel} with text: ${text.before + text.selected + text.after}`, [
        Log.stepsAsStep('TBA', 'Apply forecolor then text-decoration then unapply them', [
          tinyApis.sSetContent(`<p>${text.before + text.selected + text.after}</p>`),
          tinyApis.sFocus(),
          tinyApis.sSetSelection(selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset),
          applyForecolor(),
          tinyApis.sAssertContent(`<p>${text.before}<span style="color: #bfedd2;">${text.selected}</span>${text.after}</p>`),
          toggleInlineStyle(toolbarLabel),
          tinyApis.sAssertContent(`<p>${text.before}<span style="text-decoration: ${textDecoration};"><span style="color: #bfedd2; text-decoration: ${textDecoration};">${text.selected}</span></span>${text.after}</p>`),
          toggleInlineStyle(toolbarLabel),
          tinyApis.sAssertContent(`<p>${text.before}<span style="color: #bfedd2;">${text.selected}</span>${text.after}</p>`),
          removeForecolor(),
          tinyApis.sAssertContent(`<p>${text.before + text.selected + text.after}</p>`),
        ]),
        Log.stepsAsStep('TBA', 'Apply text-decoration then forecolor then unapply them', [
          tinyApis.sSetContent(`<p>${text.before + text.selected + text.after}</p>`),
          tinyApis.sFocus(),
          tinyApis.sSetSelection(selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset),
          toggleInlineStyle(toolbarLabel),
          tinyApis.sAssertContent(`<p>${text.before}<span style="text-decoration: ${textDecoration};">${text.selected}</span>${text.after}</p>`),
          applyForecolor(),
          // This is different to above - need to investigate this
          tinyApis.sAssertContent(`<p>${text.before}<span style="text-decoration: ${textDecoration}; color: #bfedd2;">${text.selected}</span>${text.after}</p>`),
          removeForecolor(),
          tinyApis.sAssertContent(`<p>${text.before}<span style="text-decoration: ${textDecoration};">${text.selected}</span>${text.after}</p>`),
          toggleInlineStyle(toolbarLabel),
          tinyApis.sAssertContent(`<p>${text.before + text.selected + text.after}</p>`),
        ]),
        Log.stepsAsStep('TBA', 'Apply forecolor and custom format then unapply them', [
          tinyApis.sSetContent(`<p>${text.before + text.selected + text.after}</p>`),
          tinyApis.sFocus(),
          tinyApis.sSetSelection(selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset),
          applyForecolor(),
          tinyApis.sAssertContent(`<p>${text.before}<span style="color: #bfedd2;">${text.selected}</span>${text.after}</p>`),
          applyCustomFormat('custom_format'),
          tinyApis.sAssertContent(`<p>${text.before}<span class="abc" style="color: #bfedd2; text-decoration: underline;">${text.selected}</span>${text.after}</p>`),
          removeCustomFormat('custom_format'),
          tinyApis.sAssertContent(`<p>${text.before}<span style="color: #bfedd2;">${text.selected}</span>${text.after}</p>`),
          removeForecolor(),
          tinyApis.sAssertContent(`<p>${text.before + text.selected + text.after}</p>`),
        ]),
        // Apply custom format then forecolor
        Log.stepsAsStep('TBA', 'Apply custom format and forecolor then unapply them', [
          tinyApis.sSetContent(`<p>${text.before + text.selected + text.after}</p>`),
          tinyApis.sFocus(),
          tinyApis.sSetSelection(selection.startPath, selection.sOffset, selection.finishPath, selection.fOffset),
          applyCustomFormat('custom_format'),
          tinyApis.sAssertContent(`<p>${text.before}<span class="abc" style="text-decoration: underline;">${text.selected}</span>${text.after}</p>`),
          applyForecolor(),
          tinyApis.sAssertContent(`<p>${text.before}<span class="abc" style="text-decoration: underline; color: #bfedd2;">${text.selected}</span>${text.after}</p>`),
          removeForecolor(),
          tinyApis.sAssertContent(`<p>${text.before}<span class="abc" style="text-decoration: underline;">${text.selected}</span>${text.after}</p>`),
          removeCustomFormat('custom_format'),
          tinyApis.sAssertContent(`<p>${text.before + text.selected + text.after}</p>`),
        ]),
      ]);

    const sMergeForecolorAndUnderline = sMergeForecolorAndTextDecoration('Underline', 'underline');
    const sMergeForecolorAndStrikethrough = sMergeForecolorAndTextDecoration('Strikethrough', 'line-through');

    Pipeline.async({}, [
      // Collapsed selections
      sMergeForecolorAndUnderline({before: '', selected: 'abc', after: ''}, {startPath: [0, 0], sOffset: 1, finishPath: [0, 0], fOffset: 1}),
      sMergeForecolorAndStrikethrough({before: '', selected: 'abc', after: ''}, {startPath: [0, 0], sOffset: 1, finishPath: [0, 0], fOffset: 1}),
      // Ranged selections (single word)
      sMergeForecolorAndUnderline({before: '', selected: 'abc', after: ' def'}, {startPath: [0, 0], sOffset: 0, finishPath: [0, 0], fOffset: 'abc'.length}),
      sMergeForecolorAndStrikethrough({before: '', selected: 'abc', after: ' def'}, {startPath: [0, 0], sOffset: 0, finishPath: [0, 0], fOffset: 'abc'.length}),
      // Ranged selections (part of word)
      sMergeForecolorAndUnderline({before: 'a', selected: 'b', after: 'c def'}, {startPath: [0, 0], sOffset: 1, finishPath: [0, 0], fOffset: 2}),
      sMergeForecolorAndStrikethrough({before: 'a', selected: 'b', after: 'c def'}, {startPath: [0, 0], sOffset: 1, finishPath: [0, 0], fOffset: 2}),
      // Ranged selections (multiple words)
      sMergeForecolorAndUnderline({before: '', selected: 'abc def', after: ''}, {startPath: [0, 0], sOffset: 0, finishPath: [0, 0], fOffset: 'abc def'.length}),
      sMergeForecolorAndStrikethrough({before: '', selected: 'abc def', after: ''}, {startPath: [0, 0], sOffset: 0, finishPath: [0, 0], fOffset: 'abc def'.length}),
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

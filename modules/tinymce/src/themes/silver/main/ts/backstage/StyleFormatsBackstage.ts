import { Cell, Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { BlockFormat, InlineFormat } from 'tinymce/core/api/fmt/Format';

import { FormatItem } from '../ui/core/complex/BespokeSelect';
import { getStyleFormats } from '../ui/core/complex/StyleFormat';
import * as FormatRegister from '../ui/core/complex/utils/FormatRegister';

export interface UiFactoryBackstageForStyleFormats {
  readonly getData: () => FormatItem[];
}

export const init = (editor: Editor): UiFactoryBackstageForStyleFormats => {
  const isSelectedFor = (format: string) => () => editor.formatter.match(format);

  const getPreviewFor: FormatRegister.GetPreviewForType = (format) => () => {
    const fmt = editor.formatter.get(format);
    return fmt !== undefined ? Optional.some({
      tag: fmt.length > 0 ? (fmt[0] as InlineFormat).inline || (fmt[0] as BlockFormat).block || 'div' : 'div',
      styles: editor.dom.parseStyle(editor.formatter.getCssText(format))
    }) : Optional.none();
  };

  const settingsFormats = Cell<FormatItem[]>([ ]);

  const eventsFormats = Cell<FormatItem[]>([ ]);

  const replaceSettings = Cell(false);

  editor.on('PreInit', (_e) => {
    const formats = getStyleFormats(editor);
    const enriched = FormatRegister.register(editor, formats, isSelectedFor, getPreviewFor);
    settingsFormats.set(enriched);
  });

  editor.on('addStyleModifications', (e) => {
    // Is there going to be an order issue here?
    const modifications = FormatRegister.register(editor, e.items, isSelectedFor, getPreviewFor);
    eventsFormats.set(modifications);
    replaceSettings.set(e.replace);
  });

  const getData = () => {
    const fromSettings = replaceSettings.get() ? [ ] : settingsFormats.get();
    const fromEvents = eventsFormats.get();
    return fromSettings.concat(fromEvents);
  };

  return {
    getData
  };
};

/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Option } from '@ephox/katamari';
import { getStyleFormats } from 'tinymce/themes/silver/ui/core/complex/StyleFormat';
import { FormatItem } from '../ui/core/complex/BespokeSelect';
import * as FormatRegister from '../ui/core/complex/utils/FormatRegister';
import Editor from 'tinymce/core/api/Editor';

const flatten = (fmt): string[] => {
  const subs = fmt.items;
  return subs !== undefined && subs.length > 0 ? Arr.bind(subs, flatten) : [ fmt.format ];
};

export const init = (editor: Editor) => {
  const isSelectedFor = (format) => {
    return () => {
      return editor.formatter.match(format);
    };
  };

  const getPreviewFor = (format) => () => {
    const fmt = editor.formatter.get(format);
    return fmt !== undefined ? Option.some({
      tag: fmt.length > 0 ? fmt[0].inline || fmt[0].block || 'div' : 'div',
      styleAttr: editor.formatter.getCssText(format)
    }) : Option.none();
  };

  const flatten = (fmt): string[] => {
    const subs = fmt.items;
    return subs !== undefined && subs.length > 0 ? Arr.bind(subs, flatten) : [ fmt.format ];
  };

  const settingsFormats = Cell<FormatItem[]>([ ]);
  const settingsFlattenedFormats = Cell<string[]>([ ]);

  const eventsFormats = Cell<FormatItem[]>([ ]);
  const eventsFlattenedFormats = Cell<string[]>([ ]);

  const replaceSettings = Cell(false);

  editor.on('init', () => {
    const formats = getStyleFormats(editor);
    const enriched = FormatRegister.register(editor, formats, isSelectedFor, getPreviewFor);
    settingsFormats.set(enriched);
    settingsFlattenedFormats.set(
      Arr.bind(enriched, flatten)
    );
  });

  editor.on('addStyleModifications', (e) => {
    // Is there going to be an order issue here?
    const modifications = FormatRegister.register(editor, e.items, isSelectedFor, getPreviewFor);
    eventsFormats.set(modifications);
    replaceSettings.set(e.replace);

    eventsFlattenedFormats.set(
      Arr.bind(modifications, flatten)
    );
  });

  const getData = () => {
    const fromSettings = replaceSettings.get() ? [ ] : settingsFormats.get();
    const fromEvents = eventsFormats.get();
    return fromSettings.concat(fromEvents);
  };

  const getFlattenedKeys = () => {
    const fromSettings = replaceSettings.get() ? [ ] : settingsFlattenedFormats.get();
    const fromEvents = eventsFlattenedFormats.get();
    return fromSettings.concat(fromEvents);
  };

  return {
    getData,
    getFlattenedKeys
  };
};
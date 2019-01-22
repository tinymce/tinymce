/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyTriggers } from '@ephox/alloy';
import { Arr, Option } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import { updateMenuText } from '../../dropdown/CommonDropdown';
import { createMenuItems, createSelectButton } from './BespokeSelect';
import { buildBasicSettingsDataset, Delimiter } from './SelectDatasets';

const defaultFontsFormats = 'Andale Mono=andale mono,monospace;' +
  'Arial=arial,helvetica,sans-serif;' +
  'Arial Black=arial black,sans-serif;' +
  'Book Antiqua=book antiqua,palatino,serif;' +
  'Comic Sans MS=comic sans ms,sans-serif;' +
  'Courier New=courier new,courier,monospace;' +
  'Georgia=georgia,palatino,serif;' +
  'Helvetica=helvetica,arial,sans-serif;' +
  'Impact=impact,sans-serif;' +
  'Symbol=symbol;' +
  'Tahoma=tahoma,arial,helvetica,sans-serif;' +
  'Terminal=terminal,monaco,monospace;' +
  'Times New Roman=times new roman,times,serif;' +
  'Trebuchet MS=trebuchet ms,geneva,sans-serif;' +
  'Verdana=verdana,geneva,sans-serif;' +
  'Webdings=webdings;' +
  'Wingdings=wingdings,zapf dingbats';

// A list of fonts that must be in a font family for the font to be recognised as the system stack
// Note: Don't include 'BlinkMacSystemFont', as Chrome on Mac converts it to different names
const systemStackFonts = [ '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif' ];

const isSystemFontStack = (fontFamily: string): boolean => {
  // The system font stack will be similar to the following. (Note: each has minor variants)
  // Oxide: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  // Bootstrap: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  // Wordpress: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  const matchesSystemStack = (): boolean => {
    // Split the fonts into an array and strip away any quotes
    const fonts = fontFamily.toLowerCase().split(/['"]?\s*,\s*['"]?/);
    return Arr.forall(systemStackFonts, (font) => fonts.indexOf(font.toLowerCase()) > -1);
  };

  return fontFamily.indexOf('-apple-system') === 0 && matchesSystemStack();
};

const getSpec = (editor) => {
  const getMatchingValue = (): Option<{ title: string, format: string }> => {
    const getFirstFont = (fontFamily) => {
      return fontFamily ? fontFamily.split(',')[0] : '';
    };

    const fontFamily = editor.queryCommandValue('FontName');
    const items = dataset.data;
    const font = fontFamily ? fontFamily.toLowerCase() : '';

    return Arr.find(items, (item) => {
      const format = item.format;
      return (format.toLowerCase() === font) || (getFirstFont(format).toLowerCase() === getFirstFont(font).toLowerCase());
    }).orThunk(() => {
      if (isSystemFontStack(font)) {
        return Option.from({
          title: 'System Font',
          format: font
        });
      } else {
        return Option.none();
      }
    });
  };

  const isSelectedFor = (item) => {
    return () => {
      return getMatchingValue().exists((match) => match.format === item);
    };
  };

  const getPreviewFor = (item) => () => {
    return Option.some({
      tag: 'div',
      styleAttr: item.indexOf('dings') === -1 ? 'font-family:' + item : ''
    });
  };

  const onAction = (rawItem) => () => {
    editor.undoManager.transact(() => {
      editor.focus();
      editor.execCommand('FontName', false, rawItem.format);
    });
  };

  const nodeChangeHandler = Option.some((comp) => {
    return () => {
      const fontFamily = editor.queryCommandValue('FontName');
      const match = getMatchingValue();
      const text = match.fold(() => fontFamily, (item) => item.title);
      AlloyTriggers.emitWith(comp, updateMenuText, {
        text
      });
    };
  });

  const dataset = buildBasicSettingsDataset(editor, 'font_formats', defaultFontsFormats, Delimiter.SemiColon);

  return {
    tooltip: 'Fonts',
    icon: Option.none(),
    isSelectedFor,
    getPreviewFor,
    onAction,
    nodeChangeHandler,
    dataset,
    shouldHide: false,
    isInvalid: () => false
  };
};

const createFontSelect = (editor: Editor, backstage: UiFactoryBackstage) => {
  const spec = getSpec(editor);
  return createSelectButton(editor, backstage, spec.dataset, spec);
};

// TODO: Test this!
const fontSelectMenu = (editor: Editor, backstage: UiFactoryBackstage) => {
  const spec = getSpec(editor);
  const menuItems = createMenuItems(editor, backstage, spec.dataset, spec);
  editor.ui.registry.addNestedMenuItem('fontformats', {
    text: backstage.shared.providers.translate('Fonts'),
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  });
};

export { createFontSelect, fontSelectMenu };

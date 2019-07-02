/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyTriggers, AlloyComponent } from '@ephox/alloy';
import { Arr, Obj, Option, Fun } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { updateMenuText } from '../../dropdown/CommonDropdown';
import { createMenuItems, createSelectButton } from './BespokeSelect';
import { buildBasicSettingsDataset, Delimiter } from './SelectDatasets';

const defaultFontsizeFormats = '8pt 10pt 12pt 14pt 18pt 24pt 36pt';

// See https://websemantics.uk/articles/font-size-conversion/ for conversions
const legacyFontSizes = {
  '8pt': '1',
  '10pt': '2',
  '12pt': '3',
  '14pt': '4',
  '18pt': '5',
  '24pt': '6',
  '36pt': '7'
};

const round = (number: number, precision: number) => {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

const toPt = (fontSize: string, precision?: number): string => {
  if (/[0-9.]+px$/.test(fontSize)) {
    // Round to the nearest 0.5
    return round(parseInt(fontSize, 10) * 72 / 96, precision || 0) + 'pt';
  }
  return fontSize;
};

const toLegacy = (fontSize: string): string => {
  return Obj.get(legacyFontSizes as Record<string, string>, fontSize).getOr('');
};

const getSpec = (editor: Editor) => {
  const getMatchingValue = () => {
    let matchOpt = Option.none();
    const items = dataset.data;

    const px = editor.queryCommandValue('FontSize');
    if (px) {
      // checking for three digits after decimal point, should be precise enough
      for (let precision = 3; matchOpt.isNone() && precision >= 0; precision--) {
        const pt = toPt(px, precision);
        const legacy = toLegacy(pt);
        matchOpt = Arr.find(items, (item) => item.format === px || item.format === pt || item.format === legacy);
      }
    }

    return { matchOpt, px };
  };

  const isSelectedFor = (item: string) => {
    return (valueOpt: Option<{ format: string; title: string }>) => {
      return valueOpt.exists((value) => value.format === item);
    };
  };

  const getCurrentValue = () => {
    const { matchOpt } = getMatchingValue();
    return matchOpt;
  };

  const getPreviewFor = () => Fun.constant(Option.none());

  const onAction = (rawItem) => () => {
    editor.undoManager.transact(() => {
      editor.focus();
      editor.execCommand('FontSize', false, rawItem.format);
    });
  };

  const updateSelectMenuText = (comp: AlloyComponent) => {
    const { matchOpt, px } = getMatchingValue();

    const text = matchOpt.fold(() => px, (match) => match.title);
    AlloyTriggers.emitWith(comp, updateMenuText, {
      text
    });
  };

  const nodeChangeHandler = Option.some((comp) => () => updateSelectMenuText(comp));

  const setInitialValue = Option.some((comp) => updateSelectMenuText(comp));

  const dataset = buildBasicSettingsDataset(editor, 'fontsize_formats', defaultFontsizeFormats, Delimiter.Space);

  return {
    tooltip: 'Font sizes',
    icon: Option.none(),
    isSelectedFor,
    getPreviewFor,
    getCurrentValue,
    onAction,
    setInitialValue,
    nodeChangeHandler,
    dataset,
    shouldHide: false,
    isInvalid: () => false
  };
};

const createFontsizeSelect = (editor: Editor, backstage) => {
  const spec = getSpec(editor);
  return createSelectButton(editor, backstage, spec.dataset, spec);
};

// TODO: Test this!
const fontsizeSelectMenu = (editor: Editor, backstage) => {
  const spec = getSpec(editor);
  const menuItems = createMenuItems(editor, backstage, spec.dataset, spec);
  editor.ui.registry.addNestedMenuItem('fontsizes', {
    text: 'Font sizes',
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  });
};

export { createFontsizeSelect, fontsizeSelectMenu };

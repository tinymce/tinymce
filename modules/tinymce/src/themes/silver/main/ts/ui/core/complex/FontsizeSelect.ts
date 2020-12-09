/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloyTriggers } from '@ephox/alloy';
import { Arr, Fun, Obj, Optional } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from '../../../backstage/Backstage';
import { updateMenuText } from '../../dropdown/CommonDropdown';
import { createMenuItems, createSelectButton, FormatterFormatItem, PreviewSpec, SelectSpec } from './BespokeSelect';
import { buildBasicSettingsDataset, Delimiter } from './SelectDatasets';
import * as FormatRegister from './utils/FormatRegister';

const defaultFontsizeFormats = '8pt 10pt 12pt 14pt 18pt 24pt 36pt';

// See https://websemantics.uk/articles/font-size-conversion/ for conversions
const legacyFontSizes: Record<string, string> = {
  '8pt': '1',
  '10pt': '2',
  '12pt': '3',
  '14pt': '4',
  '18pt': '5',
  '24pt': '6',
  '36pt': '7'
};

// Note: 'xx-small', 'x-small' and 'large' are rounded up to nearest whole pt
const keywordFontSizes: Record<string, string> = {
  'xx-small': '7pt',
  'x-small': '8pt',
  'small': '10pt',
  'medium': '12pt',
  'large': '14pt',
  'x-large': '18pt',
  'xx-large': '24pt'
};

const round = (number: number, precision: number) => {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

const toPt = (fontSize: string, precision?: number): string => {
  if (/[0-9.]+px$/.test(fontSize)) {
    // Round to the nearest 0.5
    return round(parseInt(fontSize, 10) * 72 / 96, precision || 0) + 'pt';
  } else {
    return Obj.get(keywordFontSizes, fontSize).getOr(fontSize);
  }
};

const toLegacy = (fontSize: string): string => Obj.get(legacyFontSizes, fontSize).getOr('');

const getSpec = (editor: Editor): SelectSpec => {
  const getMatchingValue = () => {
    let matchOpt = Optional.none<{ title: string; format: string }>();
    const items = dataset.data;

    const fontSize = editor.queryCommandValue('FontSize');
    if (fontSize) {
      // checking for three digits after decimal point, should be precise enough
      for (let precision = 3; matchOpt.isNone() && precision >= 0; precision--) {
        const pt = toPt(fontSize, precision);
        const legacy = toLegacy(pt);
        matchOpt = Arr.find(items, (item) => item.format === fontSize || item.format === pt || item.format === legacy);
      }
    }

    return { matchOpt, size: fontSize };
  };

  const isSelectedFor = (item: string) => (valueOpt: Optional<{ format: string; title: string }>) => valueOpt.exists((value) => value.format === item);

  const getCurrentValue = () => {
    const { matchOpt } = getMatchingValue();
    return matchOpt;
  };

  const getPreviewFor: FormatRegister.GetPreviewForType = Fun.constant(Optional.none as () => Optional<PreviewSpec>);

  const onAction = (rawItem: FormatterFormatItem) => () => {
    editor.undoManager.transact(() => {
      editor.focus();
      editor.execCommand('FontSize', false, rawItem.format);
    });
  };

  const updateSelectMenuText = (comp: AlloyComponent) => {
    const { matchOpt, size } = getMatchingValue();

    const text = matchOpt.fold(() => size, (match) => match.title);
    AlloyTriggers.emitWith(comp, updateMenuText, {
      text
    });
  };

  const nodeChangeHandler = Optional.some((comp: AlloyComponent) => () => updateSelectMenuText(comp));

  const setInitialValue = Optional.some((comp: AlloyComponent) => updateSelectMenuText(comp));

  const dataset = buildBasicSettingsDataset(editor, 'fontsize_formats', defaultFontsizeFormats, Delimiter.Space);

  return {
    tooltip: 'Font sizes',
    icon: Optional.none(),
    isSelectedFor,
    getPreviewFor,
    getCurrentValue,
    onAction,
    setInitialValue,
    nodeChangeHandler,
    dataset,
    shouldHide: false,
    isInvalid: Fun.never
  };
};

const createFontsizeSelect = (editor: Editor, backstage: UiFactoryBackstage) => createSelectButton(editor, backstage, getSpec(editor));

// TODO: Test this!
const fontsizeSelectMenu = (editor: Editor, backstage: UiFactoryBackstage) => {
  const menuItems = createMenuItems(editor, backstage, getSpec(editor));
  editor.ui.registry.addNestedMenuItem('fontsizes', {
    text: 'Font sizes',
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  });
};

export { createFontsizeSelect, fontsizeSelectMenu };

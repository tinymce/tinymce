import { AlloyComponent, AlloySpec, AlloyTriggers, SketchSpec } from '@ephox/alloy';
import { Arr, Fun, Obj, Optional } from '@ephox/katamari';
import { Dimension } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import * as Options from 'tinymce/themes/silver/api/Options';

import * as Events from '../../../api/Events';
import { UiFactoryBackstage } from '../../../backstage/Backstage';
import { updateMenuText } from '../../dropdown/CommonDropdown';
import { onSetupEditableToggle } from '../ControlUtils';
import { createBespokeNumberInput } from './BespokeNumberInput';
import { createMenuItems, createSelectButton, FormatterFormatItem, SelectedFormat, SelectSpec } from './BespokeSelect';
import { buildBasicSettingsDataset, Delimiter } from './SelectDatasets';
import * as FormatRegister from './utils/FormatRegister';
import * as Tooltip from './utils/Tooltip';

interface Config {
  readonly step: number;
}

export interface NumberInputSpec {
  onAction: (format: string, focusBack?: boolean) => void;
  updateInputValue: (comp: AlloyComponent) => void;
  getNewValue: (text: string, updateFunction: (value: number, step: number) => number) => string;
}

const menuTitle = 'Font sizes';
const btnTooltip = 'Font size {0}';
const fallbackFontSize = '12pt';

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

  const isSelectedFor = (item: string) => (valueOpt: Optional<SelectedFormat>) => valueOpt.exists((value) => value.format === item);

  const getCurrentValue = () => {
    const { matchOpt } = getMatchingValue();
    return matchOpt;
  };

  const getPreviewFor: FormatRegister.GetPreviewForType = Fun.constant(Optional.none);

  const onAction = (rawItem: FormatterFormatItem) => () => {
    editor.undoManager.transact(() => {
      editor.focus();
      editor.execCommand('FontSize', false, rawItem.format);
    });
  };

  const updateSelectMenuText = (comp: AlloyComponent) => {
    const { matchOpt, size } = getMatchingValue();

    const text = matchOpt.fold(Fun.constant(size), (match) => match.title);
    AlloyTriggers.emitWith(comp, updateMenuText, {
      text
    });
    Events.fireFontSizeTextUpdate(editor, { value: text });
  };

  const dataset = buildBasicSettingsDataset(editor, 'font_size_formats', Delimiter.Space);

  return {
    tooltip: Tooltip.makeTooltipText(editor, btnTooltip, fallbackFontSize),
    text: Optional.some(fallbackFontSize),
    icon: Optional.none(),
    isSelectedFor,
    getPreviewFor,
    getCurrentValue,
    onAction,
    updateText: updateSelectMenuText,
    dataset,
    shouldHide: false,
    isInvalid: Fun.never
  };
};

const createFontSizeButton = (editor: Editor, backstage: UiFactoryBackstage): SketchSpec =>
  createSelectButton(editor, backstage, getSpec(editor), btnTooltip, 'FontSizeTextUpdate');

const getConfigFromUnit = (unit: string): Config => {
  const baseConfig = { step: 1 };

  const configs: Record<string, Config> = {
    em: { step: 0.1 },
    cm: { step: 0.1 },
    in: { step: 0.1 },
    pc: { step: 0.1 },
    ch: { step: 0.1 },
    rem: { step: 0.1 }
  };

  return configs[unit] ?? baseConfig;
};

const defaultValue = 16;
const isValidValue = (value: number): boolean => value >= 0;

const getNumberInputSpec = (editor: Editor): NumberInputSpec => {
  const getCurrentValue = () => editor.queryCommandValue('FontSize');
  const updateInputValue = (comp: AlloyComponent) => AlloyTriggers.emitWith(comp, updateMenuText, {
    text: getCurrentValue()
  });

  return {
    updateInputValue,
    onAction: (format, focusBack) => editor.execCommand('FontSize', false, format, { skip_focus: !focusBack }),
    getNewValue: (text, updateFunction) => {
      Dimension.parse(text, [ 'unsupportedLength', 'empty' ]);

      const currentValue = getCurrentValue();
      const parsedText = Dimension.parse(text, [ 'unsupportedLength', 'empty' ]).or(
        Dimension.parse(currentValue, [ 'unsupportedLength', 'empty' ])
      );
      const value = parsedText.map((res) => res.value).getOr(defaultValue);
      const defaultUnit = Options.getFontSizeInputDefaultUnit(editor);
      const unit = parsedText.map((res) => res.unit).filter((u) => u !== '').getOr(defaultUnit);

      const newValue = updateFunction(value, getConfigFromUnit(unit).step);
      const res = `${isValidValue(newValue) ? newValue : value}${unit}`;
      if (res !== currentValue) {
        Events.fireFontSizeInputTextUpdate(editor, { value: res });
      }
      return res;
    }
  };
};

const createFontSizeInputButton = (editor: Editor, backstage: UiFactoryBackstage): AlloySpec =>
  createBespokeNumberInput(editor, backstage, getNumberInputSpec(editor));

// TODO: Test this!
const createFontSizeMenu = (editor: Editor, backstage: UiFactoryBackstage): void => {
  const menuItems = createMenuItems(editor, backstage, getSpec(editor));
  editor.ui.registry.addNestedMenuItem('fontsize', {
    text: menuTitle,
    onSetup: onSetupEditableToggle(editor),
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  });
};

export { createFontSizeButton, createFontSizeInputButton, createFontSizeMenu };

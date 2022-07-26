import { AlloyComponent, AlloyTriggers, SketchSpec } from '@ephox/alloy';
import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { UiFactoryBackstage } from '../../../backstage/Backstage';
import { updateMenuText } from '../../dropdown/CommonDropdown';
import { createMenuItems, createSelectButton, FormatterFormatItem, PreviewSpec, SelectedFormat, SelectSpec } from './BespokeSelect';
import { buildBasicSettingsDataset, Delimiter } from './SelectDatasets';

// A list of fonts that must be in a font family for the font to be recognised as the system stack
// Note: Don't include 'BlinkMacSystemFont', as Chrome on Mac converts it to different names
const systemStackFonts = [ '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif' ];

// Split the fonts into an array and strip away any start/end quotes
const splitFonts = (fontFamily: string): string[] => {
  const fonts = fontFamily.split(/\s*,\s*/);
  return Arr.map(fonts, (font) => font.replace(/^['"]+|['"]+$/g, ''));
};

const isSystemFontStack = (fontFamily: string): boolean => {
  // The system font stack will be similar to the following. (Note: each has minor variants)
  // Oxide: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  // Bootstrap: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  // Wordpress: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  const matchesSystemStack = (): boolean => {
    const fonts = splitFonts(fontFamily.toLowerCase());
    return Arr.forall(systemStackFonts, (font) => fonts.indexOf(font.toLowerCase()) > -1);
  };

  return fontFamily.indexOf('-apple-system') === 0 && matchesSystemStack();
};

const getSpec = (editor: Editor): SelectSpec => {
  const systemFont = 'System Font';

  const getMatchingValue = () => {
    const getFirstFont = (fontFamily: string | undefined) => fontFamily ? splitFonts(fontFamily)[0] : '';

    const fontFamily = editor.queryCommandValue('FontName');
    const items = dataset.data;
    const font = fontFamily ? fontFamily.toLowerCase() : '';

    const matchOpt = Arr.find(items, (item) => {
      const format = item.format;
      return (format.toLowerCase() === font) || (getFirstFont(format).toLowerCase() === getFirstFont(font).toLowerCase());
    }).orThunk(() => {
      return Optionals.someIf(isSystemFontStack(font), {
        title: systemFont,
        format: font
      });
    });

    return { matchOpt, font: fontFamily };
  };

  const isSelectedFor = (item: string) => (valueOpt: Optional<SelectedFormat>) =>
    valueOpt.exists((value) => value.format === item);

  const getCurrentValue = () => {
    const { matchOpt } = getMatchingValue();
    return matchOpt;
  };

  const getPreviewFor = (item: string) => () => Optional.some<PreviewSpec>({
    tag: 'div',
    styles: item.indexOf('dings') === -1 ? { 'font-family': item } : { }
  });

  const onAction = (rawItem: FormatterFormatItem) => () => {
    editor.undoManager.transact(() => {
      editor.focus();
      editor.execCommand('FontName', false, rawItem.format);
    });
  };

  const updateSelectMenuText = (comp: AlloyComponent) => {
    const { matchOpt, font } = getMatchingValue();
    const text = matchOpt.fold(Fun.constant(font), (item) => item.title);
    AlloyTriggers.emitWith(comp, updateMenuText, {
      text
    });
  };

  const dataset = buildBasicSettingsDataset(editor, 'font_family_formats', Delimiter.SemiColon);

  return {
    tooltip: 'Fonts',
    text: Optional.some(systemFont),
    icon: Optional.none(),
    isSelectedFor,
    getCurrentValue,
    getPreviewFor,
    onAction,
    updateText: updateSelectMenuText,
    dataset,
    shouldHide: false,
    isInvalid: Fun.never
  };
};

const createFontFamilyButton = (editor: Editor, backstage: UiFactoryBackstage): SketchSpec =>
  createSelectButton(editor, backstage, getSpec(editor));

// TODO: Test this!
const createFontFamilyMenu = (editor: Editor, backstage: UiFactoryBackstage): void => {
  const menuItems = createMenuItems(editor, backstage, getSpec(editor));
  editor.ui.registry.addNestedMenuItem('fontfamily', {
    text: backstage.shared.providers.translate('Fonts'),
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  });
};

export { createFontFamilyButton, createFontFamilyMenu };

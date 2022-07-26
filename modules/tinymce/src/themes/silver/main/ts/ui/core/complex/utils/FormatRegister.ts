import { Arr, Fun, Id, Obj, Optional, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { FormatReference, Separator, StyleFormat } from 'tinymce/core/api/fmt/StyleFormat';

import { FormatItem, FormatterFormatItem, PreviewSpec, SelectedFormat, SubMenuFormatItem } from '../BespokeSelect';
import { isFormatReference, isNestedFormat, NestedStyleFormat, StyleFormatType } from '../StyleFormat';

export type IsSelectedForType = (format: string) => (currentValue: Optional<SelectedFormat>) => boolean;
export type GetPreviewForType = (format: string) => () => Optional<PreviewSpec>;

const isSeparator = (format: StyleFormatType): format is Separator => {
  const keys = Obj.keys(format);
  return keys.length === 1 && Arr.contains(keys, 'title');
};

const processBasic = (item: FormatReference, isSelectedFor: IsSelectedForType, getPreviewFor: GetPreviewForType): FormatterFormatItem => ({
  ...item,
  type: 'formatter' as const,
  isSelected: isSelectedFor(item.format),
  getStylePreview: getPreviewFor(item.format)
});

// TODO: This is adapted from StyleFormats in the mobile theme. Consolidate.
const register = (editor: Editor, formats: StyleFormatType[], isSelectedFor: IsSelectedForType, getPreviewFor: GetPreviewForType): FormatItem[] => {
  const enrichSupported = (item: FormatReference): FormatterFormatItem => processBasic(item, isSelectedFor, getPreviewFor);

  // Item that triggers a submenu
  const enrichMenu = (item: NestedStyleFormat): SubMenuFormatItem => {
    const newItems = doEnrich(item.items);
    return {
      ...item,
      type: 'submenu' as const,
      getStyleItems: Fun.constant(newItems)
    };
  };

  const enrichCustom = (item: StyleFormat): FormatterFormatItem => {
    const formatName = Type.isString(item.name) ? item.name : Id.generate(item.title);
    const formatNameWithPrefix = `custom-${formatName}`;

    const newItem = {
      ...item,
      type: 'formatter' as const,
      format: formatNameWithPrefix,
      isSelected: isSelectedFor(formatNameWithPrefix),
      getStylePreview: getPreviewFor(formatNameWithPrefix)
    };
    editor.formatter.register(formatName, newItem);
    return newItem;
  };

  const doEnrich = (items: StyleFormatType[]): FormatItem[] => Arr.map(items, (item) => {
    // If it is a submenu, enrich all the subitems.
    if (isNestedFormat(item)) {
      return enrichMenu(item);
    } else if (isFormatReference(item)) {
      return enrichSupported(item);
    // NOTE: This branch is added from the original StyleFormats in mobile
    } else if (isSeparator(item)) {
      return { ...item, type: 'separator' as const };
    } else {
      return enrichCustom(item);
    }
  });

  return doEnrich(formats);
};

export {
  processBasic,
  register
};

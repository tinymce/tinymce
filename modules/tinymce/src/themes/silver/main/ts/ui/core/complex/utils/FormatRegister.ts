/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Id, Merger, Obj, Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { StyleFormat } from 'tinymce/core/api/fmt/StyleFormat';
import { TranslateIfNeeded } from 'tinymce/core/api/util/I18n';
import { FormatItem, FormatterFormatItem, PreviewSpec, SubMenuFormatItem } from '../BespokeSelect';

export type IsSelectedForType = (format: string) => (currentValue: Option<any>) => boolean;
export type GetPreviewForType = (format: string) => () => Option<PreviewSpec>;

const processBasic = (item: { format: string, title: string }, isSelectedFor, getPreviewFor): FormatterFormatItem => {
  const formatterSpec: Omit<FormatterFormatItem, 'format'> = {
    type: 'formatter',
    isSelected: isSelectedFor(item.format),
    getStylePreview: getPreviewFor(item.format)
  };
  return Merger.deepMerge(item, formatterSpec);
};

// TODO: This is adapted from StyleFormats in the mobile theme. Consolidate.
const register = (editor: Editor, formats, isSelectedFor: IsSelectedForType, getPreviewFor: GetPreviewForType) => {
  const enrichSupported = (item: { format: string, title: string }): FormatterFormatItem => {
    return processBasic(item, isSelectedFor, getPreviewFor);
  };

  // Item that triggers a submenu
  const enrichMenu = (item: { title: TranslateIfNeeded; getStyleItems: () => FormatItem[]; }): SubMenuFormatItem => {
    const submenuSpec = {
      type: 'submenu' as 'submenu'
    };

    return Merger.deepMerge(
      item,
      submenuSpec
    );
  };

  const enrichCustom = (item: StyleFormat): FormatterFormatItem => {
    const formatName = Id.generate(item.title);
    const customSpec = {
      type: 'formatter' as 'formatter',
      format: formatName,
      isSelected: isSelectedFor(formatName),
      getStylePreview: getPreviewFor(formatName)
    };

    const newItem = Merger.deepMerge(item, customSpec);
    editor.formatter.register(formatName, newItem);
    return newItem;
  };

  const doEnrich = (items): FormatItem[] => {
    return Arr.map(items, (item) => {
      const keys = Obj.keys(item);
      // If it is a submenu, enrich all the subitems.
      if (Obj.hasNonNullableKey(item, 'items')) {
        const newItems = doEnrich(item.items);
        return Merger.deepMerge(
          enrichMenu(item),
          {
            getStyleItems: () => newItems
          }
        ) as FormatItem;
      } else if (Obj.hasNonNullableKey(item, 'format')) {
        return enrichSupported(item);

        // NOTE: This branch is added from the original StyleFormats in mobile
      } else if (keys.length === 1 && Arr.contains(keys, 'title')) {
        return Merger.deepMerge(item, { type: 'separator' as 'separator' });

      } else {
        return enrichCustom(item);
      }
    });
  };

  return doEnrich(formats);
};

export {
  processBasic,
  register
};

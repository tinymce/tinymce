/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Merger, Fun, Id, Arr, Obj, Option } from '@ephox/katamari';
import { Objects } from '@ephox/boulder';
import { FormatItem, PreviewSpec } from '../BespokeSelect';
import Editor from 'tinymce/core/api/Editor';

export type IsSelectedForType = (format: string) => (currentValue: Option<any>) => boolean;
export type GetPreviewForType = (format: string) => () => Option<PreviewSpec>;

const processBasic = (item: { format: string }, isSelectedFor, getPreviewFor): FormatItem => {
  const formatterSpec: Partial<FormatItem> = {
    type: 'formatter',
    isSelected: isSelectedFor(item.format),
    getStylePreview: getPreviewFor(item.format)
  };
  return Merger.deepMerge(item, formatterSpec);
};

// TODO: This is adapted from StyleFormats in the mobile theme. Consolidate.
const register = (editor: Editor, formats, isSelectedFor: IsSelectedForType, getPreviewFor: GetPreviewForType) => {
  const enrichSupported = (item: { format: string }): FormatItem => {
    return processBasic(item, isSelectedFor, getPreviewFor);
  };

  // Item that triggers a submenu
  const enrichMenu = (item): FormatItem => {
    const submenuSpec: Partial<FormatItem> = {
      type: 'submenu',
      isSelected: Fun.constant(false),
      getStylePreview: () => Option.none()
    };

    return Merger.deepMerge(
      item,
      submenuSpec
    );
  };

  const enrichCustom = (item): FormatItem => {
    const formatName = Id.generate(item.title);
    const customSpec: Partial<FormatItem> = {
      type: 'formatter',
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
      if (Objects.hasKey(item, 'items')) {
        const newItems = doEnrich(item.items);
        return Merger.deepMerge(
          enrichMenu(item),
          {
            getStyleItems: () => newItems
          }
        ) as FormatItem;
      } else if (Objects.hasKey(item, 'format')) {
        return enrichSupported(item);

        // NOTE: This branch is added from the original StyleFormats in mobile
      } else if (keys.length === 1 && Arr.contains(keys, 'title')) {
        return Merger.deepMerge(item, { type: 'separator' }) as FormatItem;

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

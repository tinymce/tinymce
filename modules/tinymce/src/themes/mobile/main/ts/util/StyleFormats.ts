/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Toggling } from '@ephox/alloy';
import { Arr, Fun, Id, Merger, Obj } from '@ephox/katamari';

import * as StylesMenu from '../ui/StylesMenu';
import * as StyleConversions from './StyleConversions';
import Editor from 'tinymce/core/api/Editor';
import * as Settings from '../api/Settings';

const register = (editor: Editor) => {

  const isSelectedFor = (format) => (): boolean =>
    editor.formatter.match(format);

  const getPreview = (format) => (): string =>
    editor.formatter.getCssText(format);

  const enrichSupported = (item) =>
    Merger.deepMerge(item, {
      isSelected: isSelectedFor(item.format),
      getPreview: getPreview(item.format)
    });

  // Item that triggers a submenu
  const enrichMenu = (item) =>
    Merger.deepMerge(item, {
      isSelected: Fun.constant(false),
      getPreview: Fun.constant('')
    });

  const enrichCustom = (item) => {
    const formatName = Id.generate(item.title);
    const newItem = Merger.deepMerge(item, {
      format: formatName,
      isSelected: isSelectedFor(formatName),
      getPreview: getPreview(formatName)
    });
    editor.formatter.register(formatName, newItem);
    return newItem;
  };

  const doEnrich = (items) => Arr.map(items, (item) => {
    if (Obj.hasNonNullableKey(item, 'items')) {
      const newItems = doEnrich(item.items);
      return Merger.deepMerge(
        enrichMenu(item),
        {
          items: newItems
        }
      );
    } else if (Obj.hasNonNullableKey(item, 'format')) {
      return enrichSupported(item);
    } else {
      return enrichCustom(item);
    }
  });

  return doEnrich(Settings.getStyleFormats(editor));
};

const prune = (editor: Editor, formats) => {

  const doPrune = (items) => Arr.bind(items, (item) => {
    if (item.items !== undefined) {
      const newItems = doPrune(item.items);
      return newItems.length > 0 ? [ item ] : [];
    } else {
      const keep = Obj.hasNonNullableKey(item, 'format') ? editor.formatter.canApply(item.format) : true;
      return keep ? [ item ] : [];
    }
  });

  const prunedItems = doPrune(formats);
  return StyleConversions.expand(prunedItems);
};

const ui = (editor, formats, onDone) => {
  const pruned = prune(editor, formats);

  return StylesMenu.sketch({
    formats: pruned,
    handle(item, value) {
      editor.undoManager.transact(() => {
        if (Toggling.isOn(item)) {
          editor.formatter.remove(value);
        } else {
          editor.formatter.apply(value);
        }
      });
      onDone();
    }
  });
};

export {
  register,
  ui
};

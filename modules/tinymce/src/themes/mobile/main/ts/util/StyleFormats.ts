/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Toggling } from '@ephox/alloy';
import { Arr, Fun, Id, Merger, Obj } from '@ephox/katamari';

import DefaultStyleFormats from '../features/DefaultStyleFormats';
import StylesMenu from '../ui/StylesMenu';
import StyleConversions from './StyleConversions';

const register = function (editor, settings) {

  const isSelectedFor = function (format) {
    return function () {
      return editor.formatter.match(format);
    };
  };

  const getPreview = function (format) {
    return function () {
      const styles = editor.formatter.getCssText(format);
      return styles;
    };
  };

  const enrichSupported = function (item) {
    return Merger.deepMerge(item, {
      isSelected: isSelectedFor(item.format),
      getPreview: getPreview(item.format)
    });
  };

  // Item that triggers a submenu
  const enrichMenu = function (item) {
    return Merger.deepMerge(item, {
      isSelected: Fun.constant(false),
      getPreview: Fun.constant('')
    });
  };

  const enrichCustom = function (item) {
    const formatName = Id.generate(item.title);
    const newItem = Merger.deepMerge(item, {
      format: formatName,
      isSelected: isSelectedFor(formatName),
      getPreview: getPreview(formatName)
    });
    editor.formatter.register(formatName, newItem);
    return newItem;
  };

  const formats = Obj.get(settings, 'style_formats').getOr(DefaultStyleFormats);

  const doEnrich = function (items) {
    return Arr.map(items, function (item) {
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
  };

  return doEnrich(formats);
};

const prune = function (editor, formats) {

  const doPrune = function (items) {
    return Arr.bind(items, function (item) {
      if (item.items !== undefined) {
        const newItems = doPrune(item.items);
        return newItems.length > 0 ? [ item ] : [ ];
      } else {
        const keep = Obj.hasNonNullableKey(item, 'format') ? editor.formatter.canApply(item.format) : true;
        return keep ? [ item ] : [ ];
      }
    });
  };

  const prunedItems = doPrune(formats);
  return StyleConversions.expand(prunedItems);
};

const ui = function (editor, formats, onDone) {
  const pruned = prune(editor, formats);

  return StylesMenu.sketch({
    formats: pruned,
    handle (item, value) {
      editor.undoManager.transact(function () {
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

export default {
  register,
  ui
};

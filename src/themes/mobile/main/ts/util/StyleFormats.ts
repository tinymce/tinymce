import { Toggling } from '@ephox/alloy';
import { Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Id } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import DefaultStyleFormats from '../features/DefaultStyleFormats';
import StylesMenu from '../ui/StylesMenu';
import StyleConversions from './StyleConversions';

var register = function (editor, settings) {

  var isSelectedFor = function (format) {
    return function () {
      return editor.formatter.match(format);
    };
  };

  var getPreview = function (format) {
    return function () {
      var styles = editor.formatter.getCssText(format);
      return styles;
    };
  };

  var enrichSupported = function (item) {
    return Merger.deepMerge(item, {
      isSelected: isSelectedFor(item.format),
      getPreview: getPreview(item.format)
    });
  };

  // Item that triggers a submenu
  var enrichMenu = function (item) {
    return Merger.deepMerge(item, {
      isSelected: Fun.constant(false),
      getPreview: Fun.constant('')
    });
  };

  var enrichCustom = function (item) {
    var formatName = Id.generate(item.title);
    var newItem = Merger.deepMerge(item, {
      format: formatName,
      isSelected: isSelectedFor(formatName),
      getPreview: getPreview(formatName)
    });
    editor.formatter.register(formatName, newItem);
    return newItem;
  };

  var formats = Objects.readOptFrom(settings, 'style_formats').getOr(DefaultStyleFormats);

  var doEnrich = function (items) {
    return Arr.map(items, function (item) {
      if (Objects.hasKey(item, 'items')) {
        var newItems = doEnrich(item.items);
        return Merger.deepMerge(
          enrichMenu(item),
          {
            items: newItems
          }
        );
      } else if (Objects.hasKey(item, 'format')) {
        return enrichSupported(item);
      } else {
        return enrichCustom(item);
      }
    });
  };

  return doEnrich(formats);
};

var prune = function (editor, formats) {

  var doPrune = function (items) {
    return Arr.bind(items, function (item) {
      if (item.items !== undefined) {
        var newItems = doPrune(item.items);
        return newItems.length > 0 ? [ item ] : [ ];
      } else {
        var keep = Objects.hasKey(item, 'format') ? editor.formatter.canApply(item.format) : true;
        return keep ? [ item ] : [ ];
      }
    });
  };

  var prunedItems = doPrune(formats);
  return StyleConversions.expand(prunedItems);
};


var ui = function (editor, formats, onDone) {
  var pruned = prune(editor, formats);

  return StylesMenu.sketch({
    formats: pruned,
    handle: function (item, value) {
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

export default <any> {
  register: register,
  ui: ui
};
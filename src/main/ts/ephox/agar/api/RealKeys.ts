import SeleniumAction from '../server/SeleniumAction';
import { Arr } from '@ephox/katamari';
import { Adt } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';

var adt = Adt.generate([
  { combo: [ 'modifiers', 'letter' ] },
  { text: [ 's' ] },
  { backspace: [ ] }
]);

var modifierList = Struct.immutableBag([ ], [
  'ctrlKey',
  'metaKey',
  'shiftKey',
  'altKey'
]);

var toSimpleFormat = function (keys) {
  return Arr.map(keys, function (key) {
    return key.fold(function (modifiers, letter) {
      return {
        combo: {
          ctrlKey: modifiers.ctrlKey().getOr(false),
          shiftKey: modifiers.shiftKey().getOr(false),
          metaKey: modifiers.metaKey().getOr(false),
          altKey: modifiers.altKey().getOr(false),
          key: letter
        }
      };
    }, function (s) {
      return { text: s };
    }, function () {
      return { text: '\u0008' };
    });
  });
};

var sSendKeysOn = function (selector, keys) {
  return SeleniumAction.sPerform('/keys', {
    selector: selector,
    keys: toSimpleFormat(keys)
  });
};

var combo = function (modifiers, letter) {
  var mods = modifierList(modifiers);
  return adt.combo(mods, letter);
};

export default <any> {
  // Needs to preprocess
  combo: combo,
  backspace: adt.backspace,
  text: adt.text,
  sSendKeysOn: sSendKeysOn

  // TODO: sSendKeysTo (and sSendKeys) which tags the element so that it can pass through a selector
};
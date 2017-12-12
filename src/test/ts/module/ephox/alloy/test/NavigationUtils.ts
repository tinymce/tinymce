import { FocusTools } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Keyboard } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { Waiter } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';

/* global assert */

var range = function (num, f) {
  var array = new Array(num);
  return Arr.bind(array, f);
};

var sequence = function (doc, key, modifiers, identifiers) {
  var array = range(identifiers.length, function (_, i) {
    return [
      Keyboard.sKeydown(doc, key, modifiers),
      FocusTools.sTryOnSelector(
        'Focus should move from ' + (i > 0 ? identifiers[i - 1].label : '(start)') + ' to ' + identifiers[i].label,
        doc,
        identifiers[i].selector
      ),
      Step.wait(0)
    ];
  });

  return GeneralSteps.sequence(array);
};

// Selector based
var highlights = function (container, key, modifiers, identifiers) {
  var array = range(identifiers.length, function (_, i) {
    var msg = 'Highlight should move from ' + (i > 0 ? identifiers[i - 1].label : '(start)') + ' to ' + identifiers[i].label;
    var doc = Traverse.owner(container);
    return [
      Keyboard.sKeydown(doc, key, modifiers),
      Waiter.sTryUntil(
        msg,
        UiFinder.sExists(container, identifiers[i].selector),
        100,
        1000
      ),
      Step.wait(0)
    ];
  });

  return GeneralSteps.sequence(array);
};

export default <any> {
  sequence: sequence,
  highlights: highlights
};
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';
import Identify from '../words/Identify';

var nu = Struct.immutableBag([ 'elements', 'lang', 'words' ], [ ]);

var fromWalking = function (universe, groups) {
  var zones = Arr.map(groups, function (group) {
    var details = group.details();
    var lang = group.lang();

    var line = Arr.map(details, function (x) {
      return x.text();
    }).join('');

    var elements = Arr.map(details, function (x) {
      return x.item();
    });

    var words = Identify.words(line);

    return nu({
      lang: lang,
      words: words,
      elements: elements
    });
  });

  return {
    zones: Fun.constant(zones)
  };
};

export default <any> {
  fromWalking: fromWalking
};
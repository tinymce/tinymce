import { Arr } from '@ephox/katamari';
import Body from 'ephox/sugar/api/node/Body';
import Class from 'ephox/sugar/api/properties/Class';
import Element from 'ephox/sugar/api/node/Element';
import Insert from 'ephox/sugar/api/dom/Insert';
import Remove from 'ephox/sugar/api/dom/Remove';
import Resize from 'ephox/sugar/api/events/Resize';
import Width from 'ephox/sugar/api/view/Width';
import Monitors from 'ephox/sugar/impl/Monitors';
import { UnitTest } from '@ephox/bedrock';
import { setTimeout } from '@ephox/dom-globals';

UnitTest.asynctest('ResizeRaceTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var div = Element.fromTag('div');
  Insert.append(Body.body(), div);

  var handler = function () { };
  Resize.bind(div, handler);
  Remove.remove(div);
  Resize.unbind(div, handler);

  setTimeout(function () {
    if (Monitors.query(div).isSome()) {
      failure('Monitor added to div after resize was unbound');
    } else {
      success();
    }
  }, 200); // assumes the resize code still uses 100
});


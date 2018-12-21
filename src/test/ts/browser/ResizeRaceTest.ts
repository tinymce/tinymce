import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Resize from 'ephox/sugar/api/events/Resize';
import * as Monitors from 'ephox/sugar/impl/Monitors';
import { UnitTest } from '@ephox/bedrock';
import { setTimeout } from '@ephox/dom-globals';

UnitTest.asynctest('ResizeRaceTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const div = Element.fromTag('div');
  Insert.append(Body.body(), div);

  // tslint:disable-next-line:no-empty
  const handler = function () {};
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

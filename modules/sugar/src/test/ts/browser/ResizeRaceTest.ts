import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';

import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Resize from 'ephox/sugar/api/events/Resize';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Monitors from 'ephox/sugar/impl/Monitors';

UnitTest.asynctest('ResizeRaceTest', (success, failure) => {

  const div = SugarElement.fromTag('div');
  Insert.append(SugarBody.body(), div);

  const handler = Fun.noop;
  Resize.bind(div, handler);
  Remove.remove(div);
  Resize.unbind(div, handler);

  setTimeout(() => {
    if (Monitors.query(div).isSome()) {
      failure('Monitor added to div after resize was unbound');
    } else {
      success();
    }
  }, 150); // assumes the resize code still uses 100
});

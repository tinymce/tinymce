import { UnitTest } from '@ephox/bedrock-client';
import { setTimeout } from '@ephox/dom-globals';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Resize from 'ephox/sugar/api/events/Resize';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Monitors from 'ephox/sugar/impl/Monitors';

UnitTest.asynctest('ResizeRaceTest', (success, failure) => {

  const div = Element.fromTag('div');
  Insert.append(Body.body(), div);

  // tslint:disable-next-line:no-empty
  const handler = () => {};
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

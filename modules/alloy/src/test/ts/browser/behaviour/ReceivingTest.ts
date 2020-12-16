import { Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { FieldSchema, ValueSchema } from '@ephox/boulder';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Receiving } from 'ephox/alloy/api/behaviour/Receiving';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';

UnitTest.asynctest('ReceivingTest', (success, failure) => {

  GuiSetup.setup((store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      dom: {
        classes: [ 'receiving-test' ]
      },
      uid: 'custom-uid',
      containerBehaviours: Behaviour.derive([
        Keying.config({
          mode: 'execution'
        }),
        Receiving.config({
          channels: {
            'test.channel.1': {
              schema: ValueSchema.objOfOnly([
                FieldSchema.strict('dummy')
              ]),
              onReceive: (_component, data) => {
                store.adder('received: ' + data.dummy)();
              }
            }
          }
        })
      ]),
      components: [

      ]
    })
  ), (_doc, _body, gui, _component, store) => [
    store.sAssertEq('No messages yet', [ ]),
    Step.sync(() => {
      gui.broadcastOn([ 'test.channel.1' ], {
        dummy: '1'
      });
    }),
    store.sAssertEq('After broadcast to channel', [ 'received: 1' ]),
    store.sClear,
    Step.sync(() => {
      gui.broadcast({ dummy: '2' });
    }),
    store.sAssertEq('After broadcast to all', [ 'received: 2' ])
  ], success, failure);
});

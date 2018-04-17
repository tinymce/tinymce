import { Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { FieldSchema, ValueSchema } from '@ephox/boulder';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Receiving } from 'ephox/alloy/api/behaviour/Receiving';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('ReceivingTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          classes: [ 'receiving-test']
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
                onReceive (component, data) {
                  store.adder('received: ' + data.dummy())();
                }
              }
            }
          })
        ]),
        components: [

        ]
      })
    );

  }, function (doc, body, gui, component, store) {
    return [
      store.sAssertEq('No messages yet', [ ]),
      Step.sync(function () {
        gui.broadcastOn([ 'test.channel.1' ], {
          dummy: '1'
        });
      }),
      store.sAssertEq('After broadcast to channel', [ 'received: 1' ]),
      store.sClear,
      Step.sync(function () {
        gui.broadcast({ dummy: '2' });
      }),
      store.sAssertEq('After broadcast to all', [ 'received: 2' ])
    ];
  }, function () { success(); }, failure);
});

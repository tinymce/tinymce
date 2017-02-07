asynctest(
  'ReceivingTest',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema'
  ],
 
  function (Step, GuiFactory, Behaviour, Receiving, Container, GuiSetup, FieldSchema, Objects, ValueSchema) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Container.sketch({
          dom: {
            classes: [ 'receiving-test']
          },
          uid: 'custom-uid',
          keying: {
            mode: 'execution'
          },
          components: [
            
          ],
          behaviours: Behaviour.derive([
            Receiving.config({
              channels: {
                'test.channel.1': {
                  schema: ValueSchema.objOf([
                    FieldSchema.strict('dummy')
                  ]),
                  onReceive: function (component, data) {
                    store.adder('received: ' + data.dummy())();
                  }
                }
              }
            })
          ])
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
 

  }
);
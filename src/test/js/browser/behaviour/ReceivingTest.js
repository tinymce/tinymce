asynctest(
  'ReceivingTest',

  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema'
  ],

  function (Step, Behaviour, Keying, Receiving, GuiFactory, Container, GuiSetup, FieldSchema, ValueSchema) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

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
                  onReceive: function (component, data) {
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


  }
);
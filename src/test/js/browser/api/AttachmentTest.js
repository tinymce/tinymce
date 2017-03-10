asynctest(
  'Browser Test: api.AttachmentTest',

  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Container',
    'ephox.sugar.api.node.Body'
  ],

  function (Pipeline, Step, Replacing, GuiFactory, Attachment, Gui, Container, Body) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var gui = Gui.create();

    var beta = Container.sketch({
      dom: { classes: [ 'beta' ] }
    });

    var gammaSpec = Container.sketch({
      dom: { classes: [ 'gamma' ] },
      components: [
        Container.sketch({ dom: { tag: 'div', classes: [ 'gamma-1' ] } })
      ],
      events: {
        click: function () { }
      },
      behaviours: {
        replacing: {}
      }
    });


    var gammaChild = Container.sketch({
      dom: {
        tag: 'span',
        classes: [ 'gamma-child' ]
      }
    });

    var gamma = GuiFactory.build(gammaSpec);

    var alpha = GuiFactory.build(
      Container.sketch({
        dom: {
          classes: [ 'alpha-1' ]
        },
        components: [
          {
            dom: {
              tag: 'div',
              classes: [ 'alpha-1-a' ]
            }
          },
          beta
        ],

        behaviours: {
          replacing: { }
        }
      })
    );

    Attachment.attachSystem(Body.body(), gui);

    gui.add(alpha);

    Pipeline.async({ }, [
      Step.sync(function () {
        console.log('*********** alpha attach gamma ***********');
        Attachment.attach(alpha, gamma);
        console.log('*********** gamma replacing.set ***********');
        Replacing.set(gamma, [ gammaChild ]);
        console.log('*********** gamma detached ***********');
        Attachment.detach(gamma);
        
        console.log('*********** alpha attach gamma ***********');
        Attachment.attach(alpha, gamma);
        console.log('********** gamma replacing.set ******');
        // Replacing.append(gamma, gammaChild);
      })
    ], function () { success(); }, failure);
  }
);

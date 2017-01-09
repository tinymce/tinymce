asynctest(
  'StressTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.compass.Arr',
    'ephox.lumber.api.Timers'
  ],

  function (RawAssertions, Gui, GuiFactory, Container, Arr, Timers) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Arr.map([
      'CustomDefinition.toInfo',
      'CustomDefinition.behaviours',
      'CustomDefinition.toDefinition',
      'ComponentDom.combine',
      'DomModification.merge',
      'DomRender.renderToDom',
      'baseEvents',
      'baseApis',
      'events',
      'apis',

      'ResultCombine.consolidateArr',
      'ResultCombine.consolidateObj',
      'ResultCombine.consolidateObj.merge'
    ], Timers.register);

    var time = new Date().getTime();

    var r = [ ];
    for (var i = 0; i < 10000; i++) {
      r[i] = Container.build({ });
    }

    var gui = Gui.create();

    // var parent = GuiFactory.build(
    //   Container.build({
    //     components: r
    //   })
    // );
    Arr.map(r, GuiFactory.build);

    var after = new Date().getTime();

    var elapsed = after - time;
    console.log('elapsed', elapsed);

    Timers.log();

    assert.fail('Elapsed time: ' + elapsed + 'ms');
  }
);
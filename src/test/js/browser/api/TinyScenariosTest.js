asynctest(
  'TinyScenariosTest',
 
  [
    'ephox.agar.api.Arbitraries',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyScenarios',
    'ephox.sugar.api.node.Node'
  ],
 
  function (Arbitraries, Assertions, Pipeline, Step, TinyApis, TinyLoader, TinyScenarios, Node) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var apis = TinyApis(editor);
      var scenarios = TinyScenarios(editor);

      // An example test: ensure that when starting with a selection of text nodes, pressing bold twice
      // will at some point create a bold tag.
      var sAssertion = Step.stateful(function (scenario, next, die) {
        var body = editor.getBody();
        var boldInitial = body.querySelectorAll('strong').length;
        editor.execCommand('bold');
        var boldBefore = body.querySelectorAll('strong').length;
        editor.execCommand('bold');
        var boldAfter = body.querySelectorAll('strong').length;

        if (editor.selection.isCollapsed()) {
        } else {
          Assertions.assertEq('Two bold operations should create a <strong> tag at some point', true, boldInitial + boldBefore + boldAfter > 0); 
        }
        
        next();
      });
    
      Pipeline.async({}, [
        apis.sFocus,
        scenarios.sAsyncProperty('Test', Arbitraries.content('inline', { }).generator, sAssertion, {
          property: {
            tests: 100
            // Rename to seed.
            // rngState: '8cce615fb3d2a47809'
          },
          scenario: {
            exclusions: {
              containers: function (elem) {
                return !Node.isText(elem);
              }
            }
          }
        })
      ], onSuccess, onFailure);

    }, { }, success, failure);
  }
);
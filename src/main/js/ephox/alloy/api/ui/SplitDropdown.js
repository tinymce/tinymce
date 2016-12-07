define(
  'ephox.alloy.api.ui.SplitDropdown',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SplitDropdownSpec',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (Tagger, SplitDropdownSpec, Merger, Fun) {
    var ss = function ( ) {

    };
    var schema = ss([


    ], [  ], [ ]);



    var components = function (f) {
      var placeholders = {
        arrow: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.arrow>' }),
        button: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.button>' })
      };

      return f(placeholders);
    };

    var build = function (f) {
      var placeholders = {
        arrow: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.arrow>' }),
        button: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.button>' })
      };

      var spec = f(placeholders);
      var userSpec = Merger.deepMerge({
        uid: Tagger.generate('uid')
      }, spec);
      return SplitDropdownSpec.make(userSpec);
    };

    return {

      build: build,


      type: Fun.constant('split-dropdown'),
      components: components
    };
  }
);
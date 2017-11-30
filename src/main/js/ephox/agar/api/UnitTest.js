define(
  'ephox.agar.api.UnitTest',

  [
    'ephox.katamari.api.Global'
  ],

  function (Global) {
    var register = function (name, test) {
      if (typeof Global.__tests === 'undefined') {
        Global.__tests = [];
      }
  
      Global.__tests.push({ name: name, test: test });
    };

    var asynctest = function (name, test) {
      register(name, test);
    };

    var test = function (name, test) {
      register(name, function (success, failure) {
        test();
        success();
      });
    };

    var domtest = function (name, test) {
      register(name, function (success, failure) {
        // This would later include setup/teardown of jsdoc for atomic tests
        var promise = test();

        if (!(promise instanceof Promise)) {
          throw 'dom tests must return a promise';
        }

        promise.then(function () {
          success();
        }, failure);
      });
    };

    return {
      test: test,
      asynctest: asynctest,
      domtest: domtest
    };
  }
);

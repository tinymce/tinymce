define(
  'ephox.agar.demo.HtmlAssertionDemo',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.agar.demo.DemoContainer',
    'global!Error'
  ],

  function (Assertions, Pipeline, DemoContainer, Error) {
    return function () {
      DemoContainer.init(
        'HTML Assertions',
        function (success, failure) {

          Pipeline.async({}, [
            Assertions.sAssertHtml('Testing HTML', '<p>This sentence is slightly wrong</p>', '<p>This sentence is sightly wrng</p>')

          ], success, function (err) {
            failure(err);
          });

          return [ ];
        }
      );
    };
  }
);
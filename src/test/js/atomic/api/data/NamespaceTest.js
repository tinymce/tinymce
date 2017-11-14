test(
  'NamespaceTest',

  [
    'ephox.katamari.api.Namespace'
  ],

  function (Namespace) {
    var styles = Namespace.css('ephox.test');
    var css = styles.resolve('doubletest');
    assert.eq('ephox-test-doubletest', css);
  }
);

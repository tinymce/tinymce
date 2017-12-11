import Namespace from 'ephox/katamari/api/Namespace';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('NamespaceTest', function() {
  var styles = Namespace.css('ephox.test');
  var css = styles.resolve('doubletest');
  assert.eq('ephox-test-doubletest', css);
});


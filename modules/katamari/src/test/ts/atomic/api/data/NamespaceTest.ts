import * as Namespace from 'ephox/katamari/api/Namespace';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('NamespaceTest', function () {
  const styles = Namespace.css('ephox.test');
  const css = styles.resolve('doubletest');
  assert.eq('ephox-test-doubletest', css);
});

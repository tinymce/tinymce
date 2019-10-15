import * as Namespace from 'ephox/katamari/api/Namespace';
import { UnitTest, Assert } from '@ephox/bedrock-client';

UnitTest.test('NamespaceTest', function () {
  const styles = Namespace.css('ephox.test');
  const css = styles.resolve('doubletest');
  Assert.eq('style is namespaced', 'ephox-test-doubletest', css);
});

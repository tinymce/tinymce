import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Namespace from 'ephox/katamari/api/Namespace';

UnitTest.test('NamespaceTest', function () {
  const styles = Namespace.css('ephox.test');
  const css = styles.resolve('doubletest');
  Assert.eq('style is namespaced', 'ephox-test-doubletest', css);
});

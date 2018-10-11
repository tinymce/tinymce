import { UnitTest } from '@ephox/bedrock';
import TinyLoader from 'ephox/mcagar/api/TinyLoader';
import { assertVersion } from '../../module/VersionAssert';

UnitTest.asynctest('TinyLoaderVersionTest', (success, failure) => {
  TinyLoader.setupVersion('4.5.x', (editor, onSuccess) => {
    assertVersion(4, 5);

    onSuccess();
  }, {}, () => success(), failure);
});

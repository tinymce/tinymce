import { RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { getTinymce } from 'ephox/mcagar/loader/Globals';
import TinyLoader from 'ephox/mcagar/api/TinyLoader';

UnitTest.asynctest('TinyLoaderVersionTest', (success, failure) => {
  TinyLoader.setupVersion('4.6.x', (editor, onSuccess, onFailure) => {
    const tinymce = getTinymce().getOrDie('failed to get tinymce');

    RawAssertions.assertEq('Not expected major', '4', tinymce.majorVersion)
    RawAssertions.assertEq('Not expected minor', '6.7', tinymce.minorVersion)

    onSuccess();
  }, {}, () => success(), failure);
});

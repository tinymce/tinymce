import { RawAssertions } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { getTinymce } from 'ephox/mcagar/loader/Globals';
import * as TinyVersions from 'ephox/mcagar/api/TinyVersions';

UnitTest.asynctest('TinyVersionsTest', (success, failure) => {
  const sAssertVersion = (expectedMajor: string, expectedMinor: string) => {
    return Step.sync(() => {
      const tinymce = getTinymce().getOrDie('Failed to get global tinymce');

      RawAssertions.assertEq('Not expected major', expectedMajor, tinymce.majorVersion);
      RawAssertions.assertEq('Not expected minor', expectedMinor, tinymce.minorVersion)
    });
  };

  Pipeline.async({}, [
    TinyVersions.sLoad('4.6.x'),
    sAssertVersion('4', '6.7'),
    TinyVersions.sLoad('4.7.x'),
    sAssertVersion('4', '7.13'),
    TinyVersions.sWithVersion('4.6.x', sAssertVersion('4', '6.7')),
    TinyVersions.sWithVersion('4.7.x', sAssertVersion('4', '7.13'))
  ], () => success(), failure);
});

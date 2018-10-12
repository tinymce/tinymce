import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as TinyVersions from 'ephox/mcagar/api/TinyVersions';
import { sAssertVersion } from '../../module/AssertVersion';

UnitTest.asynctest('TinyVersionsTest', (success, failure) => {
  Pipeline.async({}, [
    TinyVersions.sLoad('4.5.x'),
    sAssertVersion(4, 5),
    TinyVersions.sLoad('4.8.x'),
    sAssertVersion(4, 8),
    TinyVersions.sWithVersion('4.5.x', sAssertVersion(4, 5)),
    TinyVersions.sWithVersion('4.8.x', sAssertVersion(4, 8))
  ], () => success(), failure);
});

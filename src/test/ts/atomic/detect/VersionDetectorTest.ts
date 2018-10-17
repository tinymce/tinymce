import { Version } from 'ephox/sand/detect/Version';
import Asserts from 'ephox/sand/test/Asserts';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('VersionDetectorTest', function() {
  const edgeRegex = /.*?edge\/ ?([0-9]+)\.([0-9]+)$/;

  const check = function (label: string, expected: Version, versionRegexes: RegExp[], agent: string) {
    const actual = Version.detect(versionRegexes, agent);
    Asserts.assertEq(expected, actual, label);
  };

  check('Empty string', { major: 0, minor: 0 }, [ ], '');
  check('Edge 12.0', 
    { major: 12, minor: 0 }, 
    [ edgeRegex ], 
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0'
  );
});


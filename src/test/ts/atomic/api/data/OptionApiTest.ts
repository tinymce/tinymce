import { Option } from 'ephox/katamari/api/Option';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('OptionApiTest', function() {
  var expectedApi = [
    'fold',
    'is',
    'isSome',
    'isNone',
    'getOr',
    'getOrThunk',
    'getOrDie',
    'or',
    'orThunk',
    'map',
    'ap',
    'each',
    'bind',
    'flatten',
    'exists',
    'forall',
    'filter',
    'equals',
    'equals_',
    'toArray',
    'toString'
  ];

  var checkApi = function (obj) {
    // dupe from scullion.Contracts, but we can't have circular dependencies

    var keys = Object.keys(obj);

    // Ensure all required keys are present.
    var missing = expectedApi.filter(function (req) {
      return keys.indexOf(req) < 0;
    });

    assert.eq(0, missing.length, 'Not all functions were provided. Object is missing: "' + missing + '"');

    var invalidKeys = keys.filter(function (key) {
      return expectedApi.indexOf(key) < 0;
    });

    assert.eq(0, invalidKeys.length, 'Object has extra keys: "' + invalidKeys + '"');

  };

  checkApi(Option.none());
  checkApi(Option.some('test'));
});


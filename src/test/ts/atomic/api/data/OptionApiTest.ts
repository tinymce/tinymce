import { Option } from 'ephox/katamari/api/Option';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('OptionApiTest', function() {
  const expectedApi = [
    'fold',
    'is',
    'isSome',
    'isNone',
    'getOr',
    'getOrThunk',
    'getOrDie',
    'getOrNull',
    'getOrUndefined',
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

  const checkApi = function (obj) {
    // dupe from scullion.Contracts, but we can't have circular dependencies

    const keys = Object.keys(obj);

    // Ensure all required keys are present.
    const missing = expectedApi.filter(function (req) {
      return keys.indexOf(req) < 0;
    });

    assert.eq(0, missing.length, 'Not all functions were provided. Object is missing: "' + missing + '"');

    const invalidKeys = keys.filter(function (key) {
      return expectedApi.indexOf(key) < 0;
    });

    assert.eq(0, invalidKeys.length, 'Object has extra keys: "' + invalidKeys + '"');

  };

  checkApi(Option.none());
  checkApi(Option.some('test'));
});


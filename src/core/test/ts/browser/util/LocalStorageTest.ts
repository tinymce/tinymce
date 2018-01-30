import { Pipeline, Step } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { LegacyUnit } from '@ephox/mcagar';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.util.LocalStorageTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  const teardown = Step.sync(function () {
    LocalStorage.clear();
  });

  const appendTeardown = function (steps) {
    return Arr.bind(steps, function (step) {
      return [step, teardown];
    });
  };

  suite.test('setItem', function () {
    LocalStorage.setItem('a', '1');
    LegacyUnit.equal(LocalStorage.getItem('a'), '1');
    LocalStorage.setItem('a', '2');
    LegacyUnit.equal(LocalStorage.getItem('a'), '2');
    LocalStorage.setItem('a', '3');
    LegacyUnit.equal(LocalStorage.getItem('a'), '3');
    LocalStorage.setItem('a', null);
    LegacyUnit.equal(LocalStorage.getItem('a'), 'null');
    LocalStorage.setItem('a', undefined);
    LegacyUnit.equal(LocalStorage.getItem('a'), 'undefined');
    LocalStorage.setItem('a', new Date(0).toString());
    LegacyUnit.equal(LocalStorage.getItem('a'), new Date(0).toString());
  });

  suite.test('getItem', function () {
    LocalStorage.setItem('a', '1');
    LegacyUnit.equal(LocalStorage.getItem('a'), '1');
    LocalStorage.setItem('a', '0');
    LegacyUnit.equal(LocalStorage.getItem('a'), '0');
    LegacyUnit.equal(LocalStorage.getItem('b'), null);
  });

  suite.test('removeItem', function () {
    LocalStorage.setItem('a', '1');
    LegacyUnit.equal(LocalStorage.getItem('a'), '1');
    LocalStorage.removeItem('a');
    LegacyUnit.equal(LocalStorage.getItem('a'), null);
  });

  suite.test('key', function () {
    LocalStorage.setItem('a', '1');
    LegacyUnit.equal(LocalStorage.key(0), 'a');
    LegacyUnit.equal(LocalStorage.length, 1);
  });

  suite.test('length', function () {
    LegacyUnit.equal(LocalStorage.length, 0);
    LocalStorage.setItem('a', '1');
    LegacyUnit.equal(LocalStorage.length, 1);
  });

  suite.test('clear', function () {
    LegacyUnit.equal(LocalStorage.length, 0);
    LocalStorage.setItem('a', '1');
    LegacyUnit.equal(LocalStorage.length, 1);
  });

  suite.test('setItem key and value with commas', function () {
    LocalStorage.setItem('a,1', '1,2');
    LocalStorage.setItem('b,2', '2,3');
    LegacyUnit.equal(LocalStorage.getItem('a,1'), '1,2');
    LegacyUnit.equal(LocalStorage.getItem('b,2'), '2,3');
  });

  suite.test('setItem with two large values', function () {
    let data = '';

    for (let i = 0; i < 1024; i++) {
      data += 'x';
    }

    LocalStorage.clear();
    LocalStorage.setItem('a', data + '1');
    LocalStorage.setItem('b', data);
    LegacyUnit.equal(LocalStorage.getItem('a').length, 1024 + 1);
    LegacyUnit.equal(LocalStorage.getItem('b').length, 1024);
  });

  suite.test('setItem with two large keys', function () {
    let key = '';

    for (let i = 0; i < 1024; i++) {
      key += 'x';
    }

    LocalStorage.clear();
    LocalStorage.setItem(key + '1', 'a');
    LocalStorage.setItem(key + '2', 'b');
    LegacyUnit.equal(LocalStorage.key(0), key + '1');
    LegacyUnit.equal(LocalStorage.key(1), key + '2');
  });

  LocalStorage.clear();
  const steps = appendTeardown(suite.toSteps({}));
  Pipeline.async({}, steps, function () {
    success();
  }, failure);
});

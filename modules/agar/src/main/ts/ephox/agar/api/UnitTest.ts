import { Global } from '@ephox/katamari';

const register = function (name: string, test: (success: () => void, failure: (err) => void) => void) {
  if (typeof Global.__tests === 'undefined') {
    Global.__tests = [];
  }

  Global.__tests.push({ name, test });
};

const asynctest = function (name: string, test: (success: () => void, failure: (err) => void) => void) {
  register(name, test);
};

const test = function (name: string, test: () => void) {
  register(name, function (success: () => void, failure: (err) => void) {
    try {
      test();
      success();
    } catch (e) {
      failure(e);
    }
  });
};

const domtest = function (name: string, test: () => Promise<any>) {
  register(name, function (success: () => void, failure: (err) => void) {
    // This would later include setup/teardown of jsdoc for atomic tests
    const promise = test();

    if (!(promise instanceof Promise)) {
      throw new Error('dom tests must return a promise');
    }

    promise.then(function () {
      success();
    }, failure);
  });
};

export {
  test,
  asynctest,
  domtest
};

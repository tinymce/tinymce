import { Global } from '@ephox/katamari';

var register = function (name, test) {
  if (typeof Global.__tests === 'undefined') {
    Global.__tests = [];
  }

  Global.__tests.push({ name: name, test: test });
};

var asynctest = function (name, test) {
  register(name, test);
};

var test = function (name, test) {
  register(name, function (success, failure) {
    try {
      test();
      success();
    } catch (e) {
      failure(e);
    }
  });
};

var domtest = function (name, test) {
  register(name, function (success, failure) {
    // This would later include setup/teardown of jsdoc for atomic tests
    var promise = test();

    if (!(promise instanceof Promise)) {
      throw 'dom tests must return a promise';
    }

    promise.then(function () {
      success();
    }, failure);
  });
};

export default {
  test: test,
  asynctest: asynctest,
  domtest: domtest
};
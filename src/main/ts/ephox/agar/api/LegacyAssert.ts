import Compare from '../legacy/Compare';

var eq = function (expected, actual, message) {
  var result = Compare.compare(expected, actual);
  if (!result.eq) {
    if (message !== undefined)
      throw new Error(message);
    else
      throw new Error(result.why);
  }
};

var throws = function (f, expected, message) {
  var token = {};

  try {
    f();
    throw token;
  } catch (e) {
    if (e === token)
      throw new Error(message);
    if (expected !== undefined)
      eq(expected, e, message);
  }
};

var throwsError = function (f, expected, message) {
  var token = {};

  try {
    f();
    throw token;
  } catch (e) {
    if (e === token)
      throw new Error(message);
    if (expected !== undefined)
      eq(expected, e.message, message);
  }
}

var succeeds = function (f, message) {
  try {
    f();
  } catch (e) {
    throw new Error(message);
  }
};

var fail = function (message) {
  if (message !== undefined)
    throw new Error(message);
  else
    throw new Error('Test failed.');
};

var html = function (expected, actual, message) {
  return {
    expected: expected,
    actual: actual,
    message: message
  };
};

export default <any> {
  eq: eq,
  throws: throws,
  throwsError: throwsError,
  succeeds: succeeds,
  fail: fail,
  html: html
};
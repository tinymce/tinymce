import { assert } from 'chai';

const assertIsUuid = (uuid: string): void => {
  // From https://github.com/uuidjs/uuid/blob/main/src/regex.js
  const v4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assert.isString(uuid);
  assert.match(uuid, v4Regex);
};

export {
  assertIsUuid
};

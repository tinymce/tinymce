import { describe, it, context } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Id from 'ephox/katamari/api/Id';
import * as IdUtils from 'ephox/katamari/util/IdUtils';

describe('atomic.katamari.api.data.IdTest', () => {
  context('generate', () => {
    it('Unit Tests', () => {
      const one = Id.generate('test');
      const two = Id.generate('test');
      assert.equal(one.indexOf('test'), 0);
      assert.equal(two.indexOf('test'), 0);
      assert.notEqual(one, two);
    });

    it('should not generate identical IDs', () => {
      const arbId = fc.string(1, 30).map(Id.generate);
      fc.assert(fc.property(arbId, arbId, (id1, id2) => id1 !== id2));
    });
  });

  context('uuidV4', () => {
    const assertIsUuidV4 = (uuid: string): void => {
    // From https://github.com/uuidjs/uuid/blob/main/src/regex.js
      const v4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      assert.isString(uuid);
      assert.lengthOf(uuid, 36);
      assert.match(uuid, v4Regex);
      const version = parseInt(uuid.slice(14, 15), 16);
      assert.equal(version, 4);
    };

    it('native uuids should be valid and unique', () => {
      const length = 1000;
      const uuids = Array.from({ length }, Id.uuidV4);
      const [ one, two ] = uuids;
      assertIsUuidV4(one);
      assertIsUuidV4(two);
      assert.notStrictEqual(one, two);
      assert.lengthOf(new Set(uuids), length);
    });

    it('non-native uuids should be valid and unique', () => {
      const length = 1000;
      const uuids = Array.from({ length }, IdUtils.uuidV4String);
      const [ one, two ] = uuids;
      assertIsUuidV4(one);
      assertIsUuidV4(two);
      assert.notStrictEqual(one, two);
      assert.lengthOf(new Set(uuids), length);
    });

    // https://datatracker.ietf.org/doc/html/rfc4122#section-4.4
    it('uuidV4Bytes should have correct fields set from section 4.4', () => {
      const bytes = IdUtils.uuidV4Bytes();
      const bits = bytes[8].toString(2).padStart(8, '0');
      assert.strictEqual(bits.substring(0, 2), '10');
    });
  });
});

import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as FakeStorage from 'tinymce/core/api/util/FakeStorage';

describe('browser.tinymce.core.util.LocalStorageTest', () => {
  const LocalStorage = FakeStorage.create();

  beforeEach(() => {
    LocalStorage.clear();
  });

  it('setItem', () => {
    LocalStorage.setItem('a', '1');
    assert.equal(LocalStorage.getItem('a'), '1');
    LocalStorage.setItem('a', '2');
    assert.equal(LocalStorage.getItem('a'), '2');
    LocalStorage.setItem('a', '3');
    assert.equal(LocalStorage.getItem('a'), '3');
    LocalStorage.setItem('a', null as any);
    assert.equal(LocalStorage.getItem('a'), 'null');
    LocalStorage.setItem('a', undefined as any);
    assert.equal(LocalStorage.getItem('a'), 'undefined');
    LocalStorage.setItem('a', new Date(0).toString());
    assert.equal(LocalStorage.getItem('a'), new Date(0).toString());
  });

  it('getItem', () => {
    LocalStorage.setItem('a', '1');
    assert.equal(LocalStorage.getItem('a'), '1');
    LocalStorage.setItem('a', '0');
    assert.equal(LocalStorage.getItem('a'), '0');
    assert.isNull(LocalStorage.getItem('b'));
  });

  it('removeItem', () => {
    LocalStorage.setItem('a', '1');
    assert.equal(LocalStorage.getItem('a'), '1');
    LocalStorage.removeItem('a');
    assert.isNull(LocalStorage.getItem('a'));
  });

  it('key', () => {
    LocalStorage.setItem('a', '1');
    assert.equal(LocalStorage.key(0), 'a');
    assert.lengthOf(LocalStorage, 1);
  });

  it('length', () => {
    assert.lengthOf(LocalStorage, 0);
    LocalStorage.setItem('a', '1');
    assert.lengthOf(LocalStorage, 1);
  });

  it('clear', () => {
    assert.lengthOf(LocalStorage, 0);
    LocalStorage.setItem('a', '1');
    assert.lengthOf(LocalStorage, 1);
  });

  it('setItem key and value with commas', () => {
    LocalStorage.setItem('a,1', '1,2');
    LocalStorage.setItem('b,2', '2,3');
    assert.equal(LocalStorage.getItem('a,1'), '1,2');
    assert.equal(LocalStorage.getItem('b,2'), '2,3');
  });

  it('setItem with two large values', () => {
    let data = '';

    for (let i = 0; i < 1024; i++) {
      data += 'x';
    }

    LocalStorage.clear();
    LocalStorage.setItem('a', data + '1');
    LocalStorage.setItem('b', data);
    assert.lengthOf(LocalStorage.getItem('a') as string, 1024 + 1);
    assert.lengthOf(LocalStorage.getItem('b') as string, 1024);
  });

  it('setItem with two large keys', () => {
    let key = '';

    for (let i = 0; i < 1024; i++) {
      key += 'x';
    }

    LocalStorage.clear();
    LocalStorage.setItem(key + '1', 'a');
    LocalStorage.setItem(key + '2', 'b');
    assert.equal(LocalStorage.key(0), key + '1');
    assert.equal(LocalStorage.key(1), key + '2');
  });
});

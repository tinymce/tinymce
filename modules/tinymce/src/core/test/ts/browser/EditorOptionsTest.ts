import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Fun, Type } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as EditorOptions from 'tinymce/core/api/EditorOptions';

describe('browser.tinymce.core.EditorOptionsTest', () => {
  let processed: unknown[] = [];
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  beforeEach(() => {
    processed = [];
  });

  const create = (initialOptions: Record<string, any>): EditorOptions.Options =>
    EditorOptions.create(hook.editor(), initialOptions);

  const logValue = (value: unknown) => {
    processed.push(value);
    return true;
  };

  it('TINY-8206: should process initial options when registered', () => {
    const options = create({ string_option: 'string', number_option: 'number' });

    options.register('number_option', { processor: logValue });
    options.register('string_option', { processor: logValue });

    assert.deepEqual(processed, [ 'number', 'string' ]);
  });

  it('TINY-8206: should process default values when registered', () => {
    const options = create({});

    options.register('boolean_option', { processor: logValue, default: 'boolean' });
    options.register('string_option', { processor: logValue, default: 'string' });

    assert.deepEqual(processed, [ 'boolean', 'string' ]);
  });

  it('TINY-8206: should prefer initial values over default values when registered', () => {
    const options = create({ string_option: 'string', number_option: 'number' });

    options.register('number_option', { processor: logValue, default: 'default_number' });
    options.register('string_option', { processor: logValue, default: 'default_string' });

    assert.deepEqual(processed, [ 'default_number', 'number', 'default_string', 'string' ]);
    assert.equal(options.get('string_option'), 'string');
    assert.equal(options.get('number_option'), 'number');
  });

  it('TINY-8206: should not store invalid initial or default values', () => {
    const options = create({ invalid_option: 1, valid_option: 'valid' });

    options.register('boolean_option', { processor: Fun.never, default: 'boolean' });
    options.register('invalid_option', { processor: 'string' });
    options.register('valid_option', { processor: 'string' });

    assert.isUndefined(options.get('boolean_option'));
    assert.isUndefined(options.get('invalid_option'));
    assert.equal(options.get('valid_option'), 'valid');
  });

  it('TINY-8206: set should not store unregistered options or invalid values', () => {
    const options = create({});

    options.register('invalid_option', { processor: Fun.never });
    options.register('valid_option', { processor: 'string' });

    assert.isFalse(options.set('unregistered_option', true));
    assert.isFalse(options.set('invalid_option', -1));
    assert.isTrue(options.set('valid_option', 'valid'));

    assert.isUndefined(options.get('unregistered_option'));
    assert.isUndefined(options.get('invalid_option'));
    assert.equal(options.get('valid_option'), 'valid');
  });

  it('TINY-8206: set should not be able to update immutable options', () => {
    const options = create({
      immutable: 1,
      mutable: 2
    });

    options.register('immutable', { processor: 'number', immutable: true });
    options.register('mutable', { processor: 'number' });

    assert.equal(options.get('immutable'), 1);
    assert.equal(options.get('mutable'), 2);

    assert.isFalse(options.set('immutable', 3));
    assert.isTrue(options.set('mutable', 4));

    assert.equal(options.get('immutable'), 1);
    assert.equal(options.get('mutable'), 4);
  });

  it('TINY-8206: unset should restore the default values', () => {
    const options = create({});

    options.register('valid_option', { processor: 'string[]', default: [ 'bar' ] });
    assert.deepEqual(options.get('valid_option'), [ 'bar' ]);

    options.set('valid_option', [ 'foo' ]);
    assert.deepEqual(options.get('valid_option'), [ 'foo' ]);

    assert.isTrue(options.unset('valid_option'));
    assert.deepEqual(options.get('valid_option'), [ 'bar' ]);
  });

  it('TINY-8206: isRegistered', () => {
    const options = create({});
    assert.isFalse(options.isRegistered('foo'));

    options.register('foo', { processor: 'object' });
    assert.isTrue(options.isRegistered('foo'));
  });

  it('TINY-8206: should work with the built-in processors', () => {
    const obj = {};
    const objArray = [ obj ];
    const regexp = /test/;

    const options = create({
      string: 'a',
      stringArray: [ 'a', 'b' ],
      number: 1,
      boolTrue: true,
      boolFalse: false,
      function: Fun.noop,
      object: obj,
      objectArray: objArray,
      regexp
    });

    options.register('string', { processor: 'string' });
    options.register('stringArray', { processor: 'string[]' });
    options.register('number', { processor: 'number' });
    options.register('boolTrue', { processor: 'boolean' });
    options.register('boolFalse', { processor: 'boolean' });
    options.register('function', { processor: 'function' });
    options.register('object', { processor: 'object' });
    options.register('objectArray', { processor: 'object[]' });
    options.register('objectArray', { processor: 'object[]' });
    options.register('regexp', { processor: 'regexp' });

    assert.equal(options.get('string'), 'a');
    assert.deepEqual(options.get('stringArray'), [ 'a', 'b' ]);
    assert.equal(options.get('number'), 1);
    assert.isTrue(options.get('boolTrue'));
    assert.isFalse(options.get('boolFalse'));
    assert.equal(options.get('function'), Fun.noop);
    assert.equal(options.get('object'), obj);
    assert.equal(options.get('objectArray'), objArray);
    assert.equal(options.get('regexp'), regexp);
  });

  it('TINY-8206: should work with boolean processors', () => {
    const options = create({
      boolTrue: true,
      boolFalse: false
    });

    options.register('boolTrue', { processor: Fun.always });
    options.register('boolFalse', { processor: Fun.never });

    assert.isTrue(options.get('boolTrue'));
    assert.isUndefined(options.get('boolFalse'));
  });

  it('TINY-8206: should work with custom processors', () => {
    const options = create({
      custom: 'original'
    });

    options.register('custom', {
      processor: (value) => {
        const valid = Type.isString(value);
        if (valid) {
          return ({ value: 'new' + value, valid: true });
        } else {
          return { valid: false, message: 'Must be a string!' };
        }
      }
    });

    assert.equal(options.get('custom'), 'neworiginal');
    assert.isFalse(options.set('custom', 1));
    assert.equal(options.get('custom'), 'neworiginal');
  });

  it('TINY-8206: registering multiple times should override and reprocess any values', () => {
    const options = create({ string: 'value' });

    options.register('string', { processor: 'string' });
    assert.equal(options.get('string'), 'value');

    // Same processor but setting the default should keep the old value
    options.register('string', { processor: 'string', default: 'default' });
    assert.equal(options.get('string'), 'value');
    options.unset('string');
    assert.equal(options.get('string'), 'default');

    // A different processor should drop the old value and use the new default
    options.register('string', { processor: 'number', default: 5 });
    assert.equal(options.get('string'), 5);
  });

  it('TINY-8206: isSet should return true when set or an initial value exists', () => {
    const options = create({ string: 'value' });
    assert.isFalse(options.isSet('nonexistant'));

    options.register('string', { processor: 'string' });
    options.register('number', { processor: 'number', default: 10 });
    assert.isTrue(options.isSet('string'));
    assert.isFalse(options.isSet('number'));

    options.set('string', 'test');
    options.set('number', 1);
    assert.isTrue(options.isSet('string'));
    assert.isTrue(options.isSet('number'));
  });
});

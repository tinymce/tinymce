import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Transformations from 'ephox/acid/api/colour/Transformations';

describe('browser.acid.api.ConversionsTest', () => {

  it('old tohex convered Red 0', () => {
    const input = 'rgb(0, 255, 255)';
    const result = Transformations.anyToHexString(input);
    assert.equal(result, '#00FFFF');
  });

  it('old tohex convered blue & green set to 0', () => {
    const input = 'rgb(255, 0, 0)';
    const result = Transformations.anyToHexString(input);
    assert.equal(result, '#FF0000' );
  });

  it('old tohex convered Red & blue set to 0', () => {
    const input = 'rgb(0, 0, 255)';
    const result = Transformations.anyToHexString(input);
    assert.equal(result, '#0000FF');
  });

  it('old tohex convered with spaces and such', () => {
    const input = 'rgb  (  0  , 0  , 255  )';
    const result = Transformations.anyToHexString(input);
    assert.equal(result, '#0000FF');
  });

  it('old tohex convered with extra spaces', () => {
    const input = '   rgb  (  0  , 0  , 255  )  ';
    const result = Transformations.anyToHexString(input);
    assert.equal(result, '#0000FF');
  });

  it('old tohex convered with upercase RGB', () => {
    const input = 'RGB  (  0  , 0  , 255  )  ';
    const result = Transformations.anyToHexString(input);
    assert.equal(result, '#0000FF');
  });

  it('old tohex convered with extra spaces and upercase RGB', () => {
    const input = '   RGB  (  0  , 0  , 255  )  ';
    const result = Transformations.anyToHexString(input);
    assert.equal(result, '#0000FF');
  });
});
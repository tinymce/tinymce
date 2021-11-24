import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { addToHistory, clearHistory, getHistory } from 'tinymce/themes/silver/backstage/UrlInputHistory';

describe('headless.tinymce.themes.silver.components.urlinput.HistoryTest', () => {
  it('Add URL history to local storage', () => {
    const filetype = 'test';
    clearHistory();
    assert.deepEqual([], getHistory(filetype));
    addToHistory('http://example.com', filetype);
    assert.deepEqual([ 'http://example.com' ], getHistory(filetype));
    // non-http/https urls will be silently discarded
    addToHistory('#id', filetype);
    assert.deepEqual([ 'http://example.com' ], getHistory(filetype));
    // new urls will be put at the front
    addToHistory('https://tiny.cloud', filetype);
    assert.deepEqual([ 'https://tiny.cloud', 'http://example.com' ], getHistory(filetype));
    // existing urls will be moved to the front
    addToHistory('http://example.com', filetype);
    assert.deepEqual([ 'http://example.com', 'https://tiny.cloud' ], getHistory(filetype));
    // only 5 urls will be kept
    for (let i = 1; i <= 5; i++) {
      addToHistory('http://example.com/' + i + '/', filetype);
    }
    assert.deepEqual([ 'http://example.com/5/', 'http://example.com/4/', 'http://example.com/3/', 'http://example.com/2/', 'http://example.com/1/' ], getHistory(filetype));

    // multiple types of history can be kept independently
    const filetype2 = 'test2';
    assert.deepEqual([], getHistory(filetype2));
    addToHistory('http://www.abc.net.au/news/', filetype2);
    assert.deepEqual([ 'http://www.abc.net.au/news/' ], getHistory(filetype2));
    assert.deepEqual([ 'http://example.com/5/', 'http://example.com/4/', 'http://example.com/3/', 'http://example.com/2/', 'http://example.com/1/' ], getHistory(filetype));
  });
});

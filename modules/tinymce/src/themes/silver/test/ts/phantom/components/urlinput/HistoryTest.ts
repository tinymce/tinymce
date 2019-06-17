import { assert, UnitTest } from '@ephox/bedrock';

import { addToHistory, clearHistory, getHistory } from 'tinymce/themes/silver/backstage/UrlInputHistory';

UnitTest.test('HistoryTest', () => {
  const filetype = 'test';
  clearHistory();
  assert.eq([], getHistory(filetype));
  addToHistory('http://example.com', filetype);
  assert.eq(['http://example.com'], getHistory(filetype));
  // non-http/https urls will be silently discarded
  addToHistory('#id', filetype);
  assert.eq(['http://example.com'], getHistory(filetype));
  // new urls will be put at the front
  addToHistory('https://tiny.cloud', filetype);
  assert.eq(['https://tiny.cloud', 'http://example.com'], getHistory(filetype));
  // existing urls will be moved to the front
  addToHistory('http://example.com', filetype);
  assert.eq(['http://example.com', 'https://tiny.cloud'], getHistory(filetype));
  // only 5 urls will be kept
  for (let i = 1; i <= 5; i++) {
    addToHistory('http://example.com/' + i + '/', filetype);
  }
  assert.eq(['http://example.com/5/', 'http://example.com/4/', 'http://example.com/3/', 'http://example.com/2/', 'http://example.com/1/'], getHistory(filetype));
  // multiple types of history can be kept independently
  const filetype2 = 'test2';
  assert.eq([], getHistory(filetype2));
  addToHistory('http://www.abc.net.au/news/', filetype2);
  assert.eq(['http://www.abc.net.au/news/'], getHistory(filetype2));
  assert.eq(['http://example.com/5/', 'http://example.com/4/', 'http://example.com/3/', 'http://example.com/2/', 'http://example.com/1/'], getHistory(filetype));
});
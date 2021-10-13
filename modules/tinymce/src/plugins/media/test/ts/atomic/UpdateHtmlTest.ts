import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { MediaData } from 'tinymce/plugins/media/core/Types';
import * as UpdateHtml from 'tinymce/plugins/media/core/UpdateHtml';

describe('atomic.tinymce.plugins.media.core.UpdateHtmlTest', () => {
  const testHtmlUpdate = (html: string, newData: Partial<MediaData>, updateAll: boolean, expected: string) => {
    const actual = UpdateHtml.updateHtml(html, newData, updateAll);
    assert.deepEqual(actual, expected);
  };

  it('If not updating all, nothing new is added', () => testHtmlUpdate(
    '<video><source src="oldValue"/></video>',
    {
      source: 'source1',
      sourcemime: 'source1mime',
      altsource: 'source2',
      altsourcemime: 'source2mime',
      poster: 'poster'
    },
    false,
    '<video><source src="oldValue"></video>'
  ));

  it('If updating all, add missing sources and attributes', () => testHtmlUpdate(
    '<video><source src="oldValue"/></video>',
    {
      source: 'source1',
      sourcemime: 'source1mime',
      altsource: 'source2',
      altsourcemime: 'source2mime',
      poster: 'poster'
    },
    true,
    '<video poster="poster"><source src="source1" type="source1mime"><source src="source2" type="source2mime"></video>'
  ));
});

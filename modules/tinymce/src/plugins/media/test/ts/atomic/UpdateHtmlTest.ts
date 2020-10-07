import { Assert, UnitTest } from '@ephox/bedrock-client';
import { MediaData } from 'tinymce/plugins/media/core/Types';
import * as UpdateHtml from 'tinymce/plugins/media/core/UpdateHtml';

UnitTest.test('atomic.tinymce.plugins.media.core.UpdateHtmlTest', () => {
  const testHtmlUpdate = (description: string, html: string, newData: Partial<MediaData>, updateAll: boolean, expected: string) => {
    const actual = UpdateHtml.updateHtml(html, newData, updateAll);
    Assert.eq(description, expected, actual);
  };
  testHtmlUpdate(
    'If not updating all, nothing new is added',
    '<video><source src="oldValue"/></video>',
    {
      source: 'source1',
      sourcemime: 'source1mime',
      altsource: 'source2',
      altsourcemime: 'source2mime',
      poster: 'poster'
    },
    false,
    '<video><source src="oldValue" /></video>'
  );

  testHtmlUpdate(
    'If updating all, add missing sources and attributes',
    '<video><source src="oldValue"/></video>',
    {
      source: 'source1',
      sourcemime: 'source1mime',
      altsource: 'source2',
      altsourcemime: 'source2mime',
      poster: 'poster'
    },
    true,
    '<video poster="poster"><source src="source1" type="source1mime" /><source src="source2" type="source2mime" /></video>'
  );
});

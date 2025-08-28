import { context, describe, it } from '@ephox/bedrock-client';
import { Optional, Fun } from '@ephox/katamari';
import { assert } from 'chai';
import * as DefaultAvatar from 'tiny/persona/DefaultAvatar';

const extractAttribute = (attribute: string, avatar: string): Optional<string> => {
  const match = avatar.match(new RegExp(`${attribute}="([^"]+)"`));
  return match ? Optional.from(match[1]) : Optional.none();
};
const extractWidth = Fun.curry(extractAttribute, 'width');
const extractHeight = Fun.curry(extractAttribute, 'height');
const extractColor = Fun.curry(extractAttribute, 'fill');
const extractTextContent = (avatrUrl: string) => {
  const match = avatrUrl.match(/<text[^>]*>([^<]+)<\/text>/);
  return match ? Optional.from(match[1]) : Optional.none();
};

const extractData = (avatarUrl: string) => {
  const decodedAvatarUrl = decodeURIComponent(avatarUrl.replace('data:image/svg+xml,', ''));
  return {
    width: extractWidth(decodedAvatarUrl).getOrNull(),
    height: extractHeight(decodedAvatarUrl).getOrNull(),
    color: extractColor(decodedAvatarUrl).getOrNull(),
    textContent: extractTextContent(decodedAvatarUrl).getOrNull()
  };
};

describe('atomic.default-avatar.DefaultAvatarTest', () => {
  context('generateAvatar', () => {
    it('TINY-12211: should generate avatar with all parameters working correctly', () => {
      const expectedAvatar = '<svg height="48" width="48" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="24" cy="24" r="24" fill="#FF5722"/>' +
        '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" ' +
        'fill="#FFF" font-family="sans-serif" font-size="24">DA</text>' +
        '</svg>';
      const expectedAvatarURL = 'data:image/svg+xml,' + encodeURIComponent(expectedAvatar);
      assert.equal(DefaultAvatar.generateAvatar('DA', '#FF5722', 48), expectedAvatarURL);
    });
  });

  context('generateUserAvatar', () => {
    it('TINY-12211: should generate correct user avatar', () => {
      const user = { id: 'john-doe', name: 'John Doe' };
      const expectedAvatar = '<svg height="36" width="36" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="18" cy="18" r="18" fill="#004D40"/>' +
        '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" ' +
        'fill="#FFF" font-family="sans-serif" font-size="18">J</text>' +
        '</svg>';
      const expectedAvatarURL = 'data:image/svg+xml,' + encodeURIComponent(expectedAvatar);

      assert.equal(DefaultAvatar.generateUserAvatar(user), expectedAvatarURL);
    });

    it('TINY-12211: should generate avatar with default size of 36x36', () => {
      const user = { id: 'john-doe', name: 'John Doe' };
      const url = DefaultAvatar.generateUserAvatar(user);
      const avatar = extractData(url);

      assert.equal(avatar.width, '36');
      assert.equal(avatar.height, '36');
    });

    it('TINY-12211: should respect size parameter', () => {
      const user = { id: 'john-doe', name: 'John Doe' };
      const url = DefaultAvatar.generateUserAvatar(user, { size: 50 });
      const avatar = extractData(url);

      assert.equal(avatar.width, '50');
      assert.equal(avatar.height, '50');
    });

    it('TINY-12211: should use first letter of user name as avatar text content', () => {
      const user = { id: 'john-doe', name: 'John Doe' };
      const url = DefaultAvatar.generateUserAvatar(user);
      const avatar = extractData(url);

      assert.equal(avatar.textContent, 'J');
    });

    it('TINY-12211: should extract first character using Intl.Segmenter for complex Unicode', () => {
      const user = { id: 'emoji-user', name: '👨‍💻 Developer' };
      const url = DefaultAvatar.generateUserAvatar(user);
      const avatar = extractData(url);

      assert.equal(avatar.textContent, '👨‍💻');
    });

    it('TINY-12211: Should return the same avatar color twice for the same user', () => {
      const user = { id: 'test-user-1', name: 'Test User' };
      assert.equal(extractData(DefaultAvatar.generateUserAvatar(user)).color, '#006064');
      assert.equal(extractData(DefaultAvatar.generateUserAvatar(user)).color, '#006064');
    });
  });
});

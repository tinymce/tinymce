import { Optional, Fun } from '@ephox/katamari';
import { describe, expect, it } from 'vitest';

import * as DefaultAvatar from '../../../../main/ts/defaultavatar/DefaultAvatar.ts';

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

describe('browser.defaultavatar.DefaultAvatarTest', () => {
  describe('generateAvatar', () => {
    it('TINY-12211: should generate avatar with all parameters working correctly', () => {
      const expectedAvatar = '<svg height="48" width="48" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="24" cy="24" r="24" fill="#FF5722"/>' +
        '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" ' +
        'fill="#FFF" font-family="sans-serif" font-size="24">DA</text>' +
        '</svg>';
      const expectedAvatarURL = 'data:image/svg+xml,' + encodeURIComponent(expectedAvatar);
      expect(DefaultAvatar.generateAvatar('DA', '#FF5722', 48)).toEqual(expectedAvatarURL);
    });
  });

  describe('generateUserAvatar', () => {
    it('TINY-12211: should generate correct user avatar', () => {
      const user = { id: 'john-doe', name: 'John Doe' };
      const expectedAvatar = '<svg height="36" width="36" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="18" cy="18" r="18" fill="#004D40"/>' +
        '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" ' +
        'fill="#FFF" font-family="sans-serif" font-size="18">J</text>' +
        '</svg>';
      const expectedAvatarURL = 'data:image/svg+xml,' + encodeURIComponent(expectedAvatar);

      expect(DefaultAvatar.generateUserAvatar(user)).toEqual(expectedAvatarURL);
    });

    it('TINY-12211: should generate avatar with default size of 36x36', () => {
      const user = { id: 'john-doe', name: 'John Doe' };
      const url = DefaultAvatar.generateUserAvatar(user);
      const avatar = extractData(url);

      expect(avatar.width).toBe('36');
      expect(avatar.height).toBe('36');
    });

    it('TINY-12211: should respect size parameter', () => {
      const user = { id: 'john-doe', name: 'John Doe' };
      const url = DefaultAvatar.generateUserAvatar(user, { size: 50 });
      const avatar = extractData(url);

      expect(avatar.width).toBe('50');
      expect(avatar.height).toBe('50');
    });

    it('TINY-12211: should use first letter of user name as avatar text content', () => {
      const user = { id: 'john-doe', name: 'John Doe' };
      const url = DefaultAvatar.generateUserAvatar(user);
      const avatar = extractData(url);

      expect(avatar.textContent).toBe('J');
    });

    it('TINY-12211: should extract first character using Intl.Segmenter for complex Unicode', () => {
      const user = { id: 'emoji-user', name: '👨‍💻 Developer' };
      const url = DefaultAvatar.generateUserAvatar(user);
      const avatar = extractData(url);

      expect(avatar.textContent).toBe('👨‍💻');
    });

    it('TINY-12211: Should return the same avatar color twice for the same user', () => {
      const user = { id: 'test-user-1', name: 'Test User' };
      expect(extractData(DefaultAvatar.generateUserAvatar(user)).color).toBe('#006064');
      expect(extractData(DefaultAvatar.generateUserAvatar(user)).color).toBe('#006064');
    });
  });
});

import { Attr, Element, Insert, SelectorFind } from '@ephox/sugar';

/*
 * The purpose of this fix is to toggle the presence of a meta tag which disables scrolling
 * for the user
 */
const tag = function () {
  const head = SelectorFind.first('head').getOrDie();

  const nu = function () {
    const meta = Element.fromTag('meta');
    Attr.set(meta, 'name', 'viewport');
    Insert.append(head, meta);
    return meta;
  };

  const element = SelectorFind.first('meta[name="viewport"]').getOrThunk(nu);
  const backup = Attr.get(element, 'content');

  const maximize = function () {
    Attr.set(element, 'content', 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0');
  };

  const restore = function () {
    if (backup !== undefined && backup !== null && backup.length > 0) {
      Attr.set(element, 'content', backup);
    } else {
      // According to apple docs the default is:
      //  width=980
      //  height=<calculated>
      //  initial-scale=<calculated>
      //  minimum-scale=0.25
      //  maximum-scale=5.0
      //  user-scalable yes
      // However just setting user-scalable seems to fix pinch zoom and who knows these defaults might change
      Attr.set(element, 'content', 'user-scalable=yes');
    }
  };

  return {
    maximize,
    restore
  };
};

export default {
  tag
};
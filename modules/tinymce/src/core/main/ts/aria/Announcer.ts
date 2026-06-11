import { Arr, Id, Singleton, Strings } from '@ephox/katamari';
import { Attribute, Css, Insert, Remove, SelectorFilter, SugarBody, SugarElement, TextContent } from '@ephox/sugar';

export const announcerContainerId = Id.generate('tiny-aria-announcer');

const POLITE_MESSAGE_TTL_MS = 600000; // 10 minutes
const politeTimestampAttr = 'data-mce-announced-at';

export interface Announcer {
  readonly polite: (message: string) => void;
  readonly assertive: (message: string) => void;
}

interface AnnouncerState {
  readonly container: SugarElement<HTMLElement>;
  readonly politeRegion: SugarElement<HTMLDivElement>;
  readonly assertiveRegion: SugarElement<HTMLDivElement>;
}

const OFFSCREEN_STYLES = {
  position: 'absolute',
  left: '-9999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden'
};

const createPoliteRegion = (): SugarElement<HTMLDivElement> => {
  const region = SugarElement.fromTag('div');
  Attribute.setAll(region, {
    'aria-live': 'polite',
    'aria-atomic': 'false',
    'aria-relevant': 'additions'
  });
  return region;
};

const createAssertiveRegion = (): SugarElement<HTMLDivElement> => {
  const region = SugarElement.fromTag('div');
  Attribute.setAll(region, {
    'aria-live': 'assertive',
    'aria-atomic': 'true'
  });
  return region;
};

const isConnected = (element: SugarElement<HTMLElement>): boolean => element.dom.isConnected;

const createNewState = () => {
  const container = SugarElement.fromTag('div');
  const politeRegion = createPoliteRegion();
  const assertiveRegion = createAssertiveRegion();

  Attribute.set(container, 'id', announcerContainerId);
  Css.setAll(container, OFFSCREEN_STYLES);

  Insert.append(container, politeRegion);
  Insert.append(container, assertiveRegion);
  Insert.append(SugarBody.body(), container);

  return { container, politeRegion, assertiveRegion };
};

const cleanupExpiredPoliteMessages = (polite: SugarElement<HTMLDivElement>, now: number): void => {
  Arr.each(SelectorFilter.children(polite, `div[${politeTimestampAttr}]`), (messageDiv) => {
    Attribute.getOpt(messageDiv, politeTimestampAttr)
      .bind((value) => Strings.toInt(value))
      .filter((announcedAt) => now - announcedAt > POLITE_MESSAGE_TTL_MS)
      .each(() => Remove.remove(messageDiv));
  });
};

export const createAnnouncer = (): Announcer => {
  const state = Singleton.value<AnnouncerState>();

  const mountRegions = () => {
    return state.get().filter(({ container }) => isConnected(container)).getOrThunk(() => {
      const newState = createNewState();
      state.set(newState);
      return newState;
    });
  };

  const polite = (message: string): void => {
    const { politeRegion } = mountRegions();
    const now = Date.now();

    cleanupExpiredPoliteMessages(politeRegion, now);

    const messageDiv = SugarElement.fromTag('div');
    Attribute.set(messageDiv, politeTimestampAttr, String(now));
    Insert.append(messageDiv, SugarElement.fromText(message));
    Insert.append(politeRegion, messageDiv);
  };

  const assertive = (message: string): void => {
    TextContent.set(mountRegions().assertiveRegion, message);
  };

  return { polite, assertive };
};

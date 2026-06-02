import { Id, Optional, Singleton } from '@ephox/katamari';
import { Attribute, Css, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

export const announcerContainerId = Id.generate('tiny-aria-announcer');

export interface Announcer {
  readonly polite: (message: string) => void;
  readonly assertive: (message: string) => void;
}

const POLITE_MESSAGE_TTL_MS = 60000;

const offscreenStyles = {
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
    'aria-atomic': 'true',
    'role': 'alert'
  });
  return region;
};

interface AnnouncerState {
  readonly container: SugarElement<HTMLElement>;
  readonly polite: SugarElement<HTMLDivElement>;
  readonly assertive: Optional<SugarElement<HTMLDivElement>>;
}

const isConnected = (element: SugarElement<HTMLElement>): boolean => element.dom.isConnected;

export const createAnnouncer = (): Announcer => {
  const state = Singleton.value<AnnouncerState>();

  const ensureMounted = (): AnnouncerState =>
    state.get().filter((s) => isConnected(s.container) && isConnected(s.polite)).getOrThunk(() => {
      state.on((s) => {
        if (isConnected(s.container)) {
          Remove.remove(s.container);
        }
      });
      const container = SugarElement.fromTag('div');
      Attribute.set(container, 'id', announcerContainerId);
      Css.setAll(container, offscreenStyles);

      const polite = createPoliteRegion();
      Insert.append(container, polite);
      Insert.append(SugarBody.body(), container);

      const newState: AnnouncerState = { container, polite, assertive: Optional.none() };
      state.set(newState);
      return newState;
    });

  const polite = (message: string): void => {
    const s = ensureMounted();
    const messageDiv = SugarElement.fromTag('div');
    Insert.append(messageDiv, SugarElement.fromText(message));
    Insert.append(s.polite, messageDiv);
    setTimeout(() => {
      if (isConnected(messageDiv)) {
        Remove.remove(messageDiv);
      }
    }, POLITE_MESSAGE_TTL_MS);
  };

  const assertive = (message: string): void => {
    const s = ensureMounted();
    s.assertive.each((r) => Remove.remove(r));
    const region = createAssertiveRegion();
    Insert.append(region, SugarElement.fromText(message));
    Insert.append(s.container, region);
    state.set({ ...s, assertive: Optional.some(region) });
  };

  return { polite, assertive };
};

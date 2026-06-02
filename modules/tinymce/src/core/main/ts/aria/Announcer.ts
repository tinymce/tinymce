import { Fun, Id, Singleton } from '@ephox/katamari';
import { Attribute, Css, Insert, SugarBody, SugarElement, TextContent } from '@ephox/sugar';

export const announcerContainerId = Id.generate('tiny-aria-announcer');

export interface Announcer {
  readonly polite: (message: string) => void;
  readonly assertive: (message: string) => void;
}

interface AnnouncerState {
  readonly container: SugarElement<HTMLElement>;
  readonly polite: SugarElement<HTMLDivElement>;
  readonly assertive: SugarElement<HTMLDivElement>;
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

const wait = (duration: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, duration));

const isConnected = (element: SugarElement<HTMLElement>): boolean => element.dom.isConnected;

export const createAnnouncer = (): Announcer => {
  const state = Singleton.value<AnnouncerState>();

  const mountRegions = async () => {
    return state.get().filter(({ container }) => isConnected(container)).fold(
      async () => {
        const container = SugarElement.fromTag('div');
        const polite = createPoliteRegion();
        const assertive = createAssertiveRegion();

        Attribute.set(container, 'id', announcerContainerId);
        Css.setAll(container, OFFSCREEN_STYLES);

        Insert.append(container, polite);
        Insert.append(container, assertive);
        Insert.append(SugarBody.body(), container);

        const newState: AnnouncerState = { container, polite, assertive };
        state.set(newState);

        await wait(50); // Wait for screen readers to pick up the new regions before adding messages

        return newState;
      },
      (state) => Promise.resolve(state)
    );
  };

  const polite = (message: string): void => {
    mountRegions().then(({ polite }) => {
      const messageDiv = SugarElement.fromTag('div');
      Insert.append(messageDiv, SugarElement.fromText(message));
      Insert.append(polite, messageDiv);
    }).catch(Fun.noop);
  };

  const assertive = (message: string): void => {
    mountRegions().then(({ assertive }) => {
      TextContent.set(assertive, message);
    }).catch(Fun.noop);
  };

  return { polite, assertive };
};

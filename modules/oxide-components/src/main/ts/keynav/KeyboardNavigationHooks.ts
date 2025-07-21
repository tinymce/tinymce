import { Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { useEffect, type RefObject } from 'react';

import * as FlowType from './keyboard/flowtype/FlowType';
import * as KeyingType from './keyboard/KeyingType';
import * as SpecialType from './keyboard/SpecialType';
import * as TabbingType from './keyboard/TabbingType';

interface BaseProps {
  /** The container element to bind keyboard events to. */
  containerRef: RefObject<HTMLElement>;
}

const bindEvents = (container: HTMLElement, handlers: KeyingType.Handlers) => {
  container?.addEventListener('keydown', handlers.keydown);
  container?.addEventListener('keyup', handlers.keyup);
  container?.addEventListener('focus', handlers.focus);

  return () => {
    container?.removeEventListener('keydown', handlers.keydown);
    container?.removeEventListener('keyup', handlers.keyup);
    container?.removeEventListener('focus', handlers.focus);
  };
};

export interface TabKeyingProps extends BaseProps, TabbingType.TabbingConfig { }

export const useTabKeyNavigation = (props: TabKeyingProps): void => {
  useEffect(() => {
    const { containerRef } = props;

    if (containerRef.current) {
      const handlers = TabbingType.create(SugarElement.fromDom(containerRef.current), props);
      return bindEvents(containerRef.current, handlers);
    } else {
      return Fun.noop;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export interface FlowKeyingProps extends BaseProps, FlowType.FlowConfig { }

export const useFlowKeyNavigation = (props: FlowKeyingProps): void => {
  useEffect(() => {
    const { containerRef } = props;

    if (containerRef.current) {
      const handlers = FlowType.create(SugarElement.fromDom(containerRef.current), props);
      return bindEvents(containerRef.current, handlers);
    } else {
      return Fun.noop;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ ]);
};

export interface SpecialKeyingProps extends BaseProps, SpecialType.SpecialConfig { }

export const useSpecialKeyNavigation = (props: SpecialKeyingProps): void => {
  useEffect(() => {
    const { containerRef } = props;

    if (containerRef.current) {
      const handlers = SpecialType.create(SugarElement.fromDom(containerRef.current), props);
      return bindEvents(containerRef.current, handlers);
    } else {
      return Fun.noop;
    }
  }
  , [ props ]);
};

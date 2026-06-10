import { Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { useCallback, useEffect, useRef, type RefObject } from 'react';

import * as EscapingType from './keyboard/escaping/EscapingType';
import * as ExecutingType from './keyboard/execution/ExecutionType';
import * as FlowType from './keyboard/flowtype/FlowType';
import type * as KeyingType from './keyboard/KeyingType';
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

export interface TabKeyNavigationApi {
  readonly goBackwards: () => void;
}

export const useTabKeyNavigation = (props: TabKeyingProps): TabKeyNavigationApi => {
  const goBackwardsRef = useRef<() => void>(Fun.noop);

  useEffect(() => {
    const { containerRef } = props;

    if (containerRef.current) {
      const handlers = TabbingType.create(SugarElement.fromDom(containerRef.current), props);
      goBackwardsRef.current = handlers.goBackwards;
      return bindEvents(containerRef.current, handlers);
    } else {
      goBackwardsRef.current = Fun.noop;
      return Fun.noop;
    }
  }, [ props ]);

  const goBackwardsCallback = useCallback(() => goBackwardsRef.current(), []);
  return { goBackwards: goBackwardsCallback };
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
  }, [ props ]);
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
  }, [ props ]);
};

export interface ExecutingConfig extends BaseProps, ExecutingType.ExecutingConfig { }

export const useExecutionType = (props: ExecutingConfig): void => {
  useEffect(() => {
    const { containerRef } = props;

    if (containerRef.current) {
      const handlers = ExecutingType.create(SugarElement.fromDom(containerRef.current), props);
      return bindEvents(containerRef.current, handlers);
    } else {
      return Fun.noop;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export interface EscapeKeyProps extends BaseProps, EscapingType.EscapingConfig { }

export const useEscapeKeyNavigation = (props: EscapeKeyProps): void => {
  useEffect(() => {
    const { containerRef } = props;

    if (containerRef.current) {
      const handlers = EscapingType.create(SugarElement.fromDom(containerRef.current), props);
      return bindEvents(containerRef.current, handlers);
    } else {
      return Fun.noop;
    }
  }, [ props ]);
};

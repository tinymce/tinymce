import { Fun, Optional } from '@ephox/katamari';
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
  const propsRef = useRef(props);
  propsRef.current = props;
  const { containerRef } = props;

  useEffect(() => {
    if (containerRef.current) {
      const wrappedProps: TabbingType.TabbingConfig = {
        selector: propsRef.current.selector,
        ...(propsRef.current.execute && { execute: (focused) => propsRef.current.execute?.(focused) ?? Optional.none() }),
        ...(propsRef.current.escape && { escape: (focused) => propsRef.current.escape?.(focused) ?? Optional.none() }),
        ...(propsRef.current.firstTabstop !== undefined && { firstTabstop: propsRef.current.firstTabstop }),
        ...(propsRef.current.useTabstopAt && { useTabstopAt: (elem) => propsRef.current.useTabstopAt?.(elem) ?? true }),
        ...(propsRef.current.cyclic !== undefined && { cyclic: propsRef.current.cyclic }),
        ...(propsRef.current.focusIn !== undefined && { focusIn: propsRef.current.focusIn }),
        ...(propsRef.current.closest !== undefined && { closest: propsRef.current.closest }),
      };
      const handlers = TabbingType.create(SugarElement.fromDom(containerRef.current), wrappedProps);
      goBackwardsRef.current = handlers.goBackwards;
      return bindEvents(containerRef.current, handlers);
    } else {
      goBackwardsRef.current = Fun.noop;
      return Fun.noop;
    }
  }, [ containerRef ]);

  const goBackwardsCallback = useCallback(() => goBackwardsRef.current(), []);
  return { goBackwards: goBackwardsCallback };
};

export interface FlowKeyingProps extends BaseProps, FlowType.FlowConfig { }

export const useFlowKeyNavigation = (props: FlowKeyingProps): void => {
  const propsRef = useRef(props);
  propsRef.current = props;
  const { containerRef } = props;

  useEffect(() => {
    if (containerRef.current) {
      const wrappedProps: FlowType.FlowConfig = {
        selector: propsRef.current.selector,
        ...(propsRef.current.execute && { execute: (focused) => propsRef.current.execute?.(focused) ?? Optional.none() }),
        ...(propsRef.current.escape && { escape: (focused) => propsRef.current.escape?.(focused) ?? Optional.none() }),
        ...(propsRef.current.allowVertical !== undefined && { allowVertical: propsRef.current.allowVertical }),
        ...(propsRef.current.allowHorizontal !== undefined && { allowHorizontal: propsRef.current.allowHorizontal }),
        ...(propsRef.current.cycles !== undefined && { cycles: propsRef.current.cycles }),
        ...(propsRef.current.focusIn !== undefined && { focusIn: propsRef.current.focusIn }),
        ...(propsRef.current.closest !== undefined && { closest: propsRef.current.closest }),
      };
      const handlers = FlowType.create(SugarElement.fromDom(containerRef.current), wrappedProps);
      return bindEvents(containerRef.current, handlers);
    } else {
      return Fun.noop;
    }
  }, [ containerRef ]);
};

export interface SpecialKeyingProps extends BaseProps, SpecialType.SpecialConfig { }

export const useSpecialKeyNavigation = (props: SpecialKeyingProps): void => {
  const propsRef = useRef(props);
  propsRef.current = props;
  const { containerRef } = props;

  useEffect(() => {
    if (containerRef.current) {
      const wrappedProps: SpecialType.SpecialConfig = {
        ...(propsRef.current.onSpace && { onSpace: () => propsRef.current.onSpace?.() }),
        ...(propsRef.current.onEnter && { onEnter: () => propsRef.current.onEnter?.() }),
        ...(propsRef.current.onTab && { onTab: () => propsRef.current.onTab?.() }),
        ...(propsRef.current.onShiftTab && { onShiftTab: () => propsRef.current.onShiftTab?.() }),
        ...(propsRef.current.onShiftEnter && { onShiftEnter: () => propsRef.current.onShiftEnter?.() }),
        ...(propsRef.current.onLeft && { onLeft: () => propsRef.current.onLeft?.() }),
        ...(propsRef.current.onRight && { onRight: () => propsRef.current.onRight?.() }),
        ...(propsRef.current.onUp && { onUp: () => propsRef.current.onUp?.() }),
        ...(propsRef.current.onDown && { onDown: () => propsRef.current.onDown?.() }),
        ...(propsRef.current.onEscape && { onEscape: () => propsRef.current.onEscape?.() }),
      };
      const handlers = SpecialType.create(SugarElement.fromDom(containerRef.current), wrappedProps);
      return bindEvents(containerRef.current, handlers);
    } else {
      return Fun.noop;
    }
  }, [ containerRef ]);
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
  const propsRef = useRef(props);
  propsRef.current = props;
  const { containerRef } = props;

  useEffect(() => {
    if (containerRef.current) {
      const wrappedProps: EscapingType.EscapingConfig = {
        onEscape: (comp, event) => propsRef.current.onEscape(comp, event),
      };
      const handlers = EscapingType.create(SugarElement.fromDom(containerRef.current), wrappedProps);
      return bindEvents(containerRef.current, handlers);
    } else {
      return Fun.noop;
    }
  }, [ containerRef ]);
};

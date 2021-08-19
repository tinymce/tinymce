/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Obj, Optional, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import { FormatEvent } from '../api/EventTypes';
import { EditorEvent } from '../api/util/EventDispatcher';
import * as NodeType from '../dom/NodeType';
import { RangeLikeObject } from '../selection/RangeTypes';
import { FormatVars } from './FormatTypes';
import * as FormatUtils from './FormatUtils';
import * as MatchFormat from './MatchFormat';

export type FormatChangeCallback = (state: boolean, data: { node: Node; format: string; parents: any }) => void;

export type RegisteredFormats = Record<string, CallbackGroup>;

export interface UnbindFormatChanged {
  unbind: () => void;
}

interface CallbackWithoutVars {
  readonly state: Cell<boolean>;
  readonly similar: boolean;
  readonly callbacks: FormatChangeCallback[];
}

interface CallbackWithVars {
  readonly state: Cell<boolean>;
  readonly similar: boolean;
  readonly vars: FormatVars;
  readonly callback: FormatChangeCallback;
}

interface CallbackGroup {
  // Batch all callbacks that don't have custom variables into one "similar=true" and one "similar=false" group
  readonly withSimilar: CallbackWithoutVars;
  readonly withoutSimilar: CallbackWithoutVars;
  // For callbacks with custom variables, handle everything separately
  readonly withVars: CallbackWithVars[];
}

const setup = (registeredFormatListeners: Cell<RegisteredFormats>, editor: Editor) => {
  registeredFormatListeners.set({});

  editor.on('NodeChange', (e) => {
    updateAndFireChangeCallbacks(editor, e.element, registeredFormatListeners.get());
  });

  editor.on('FormatApply FormatRemove', (e: EditorEvent<FormatEvent>) => {
    const element = Optional.from(e.node)
      .map((nodeOrRange) => Obj.get(nodeOrRange as RangeLikeObject, 'startContainer').getOr(nodeOrRange as Node))
      .bind((node) => NodeType.isElement(node) ? Optional.some(node) : Optional.from(node.parentElement))
      .getOrThunk(() => editor.selection.getNode());

    updateAndFireChangeCallbacks(editor, element, registeredFormatListeners.get());
  });
};

const matchingNode = (editor: Editor, parents: Element[], format: string, similar: boolean, vars?: FormatVars): Optional<Element> => {
  const isMatchingNode = (node: Element) => {
    const matchingFormat = editor.formatter.matchNode(node, format, vars ?? {}, similar);
    return !Type.isUndefined(matchingFormat);
  };
  const isUnableToMatch = (node: Element) => {
    if (MatchFormat.matchesUnInheritedFormatSelector(editor, node, format)) {
      return true;
    } else {
      if (!similar) {
        // If we want to find an exact match, then finding a similar match halfway up the parents tree is bad
        return Type.isNonNullable(editor.formatter.matchNode(node, format, vars, true));
      } else {
        return false;
      }
    }
  };
  return Arr.findUntil(parents, isMatchingNode, isUnableToMatch);
};

const getParents = (editor: Editor, elm?: Element): Element[] => {
  const element = elm ?? editor.selection.getNode();
  return Arr.filter(FormatUtils.getParents(editor.dom, element), (node) =>
    NodeType.isElement(node) && !NodeType.isBogus(node)
  );
};

const hasChanged = (state: Cell<boolean>, newState: boolean): boolean => {
  if (state.get() === newState) {
    return false;
  } else {
    state.set(newState);
    return true;
  }
};

const updateAndFireChangeCallbacks = (editor: Editor, elm: Element, registeredCallbacks: RegisteredFormats) => {
  // Ignore bogus nodes like the <a> tag created by moveStart()
  const parents = getParents(editor, elm);

  Obj.each(registeredCallbacks, (data, format) => {
    Arr.each([ data.withSimilar, data.withoutSimilar ], (spec) => {
      if (spec.callbacks.length > 0) {
        const match = matchingNode(editor, parents, format, spec.similar);
        if (hasChanged(spec.state, match.isSome())) {
          const node = match.getOr(elm);
          Arr.each(spec.callbacks, (callback) => callback(match.isSome(), { node, format, parents }));
        }
      }
    });

    Arr.each(data.withVars, (item) => {
      const match = matchingNode(editor, parents, format, item.similar, item.vars);
      if (hasChanged(item.state, match.isSome())) {
        const node = match.getOr(elm);
        item.callback(match.isSome(), { node, format, parents });
      }
    });
  });
};

const addListeners = (
  editor: Editor,
  registeredFormatListeners: Cell<RegisteredFormats>,
  formats: string,
  callback: FormatChangeCallback,
  similar?: boolean,
  vars?: FormatVars
) => {
  const formatChangeItems = registeredFormatListeners.get();

  Arr.each(formats.split(','), (format) => {
    const group = Obj.get(formatChangeItems, format).getOrThunk(() => {
      const base: CallbackGroup = {
        withSimilar: {
          state: Cell(false),
          similar: true,
          callbacks: []
        },
        withoutSimilar: {
          state: Cell(false),
          similar: false,
          callbacks: []
        },
        withVars: []
      };

      formatChangeItems[format] = base;
      return base;
    });

    const getCurrent = () => {
      const parents = getParents(editor);
      return matchingNode(editor, parents, format, similar, vars).isSome();
    };
    if (Type.isUndefined(vars)) {
      const toAppendTo = similar ? group.withSimilar : group.withoutSimilar;
      toAppendTo.callbacks.push(callback);
      if (toAppendTo.callbacks.length === 1) {
        toAppendTo.state.set(getCurrent());
      }
    } else {
      group.withVars.push({
        state: Cell(getCurrent()),
        similar,
        vars,
        callback
      });
    }
  });

  registeredFormatListeners.set(formatChangeItems);
};

const removeListeners = (registeredFormatListeners: Cell<RegisteredFormats>, formats: string, callback: FormatChangeCallback) => {
  const formatChangeItems = registeredFormatListeners.get();

  Arr.each(formats.split(','), (format) => Obj.get(formatChangeItems, format).each((group) => {
    formatChangeItems[format] = {
      withSimilar: {
        state: group.withSimilar.state,
        similar: group.withSimilar.similar,
        callbacks: Arr.filter(group.withSimilar.callbacks, (cb) => cb !== callback),
      },
      withoutSimilar: {
        state: group.withoutSimilar.state,
        similar: group.withoutSimilar.similar,
        callbacks: Arr.filter(group.withoutSimilar.callbacks, (cb) => cb !== callback),
      },
      withVars: Arr.filter(group.withVars, (item) => item.callback !== callback),
    };
  }));

  registeredFormatListeners.set(formatChangeItems);
};

const formatChangedInternal = (
  editor: Editor,
  registeredFormatListeners: Cell<RegisteredFormats>,
  formats: string,
  callback: FormatChangeCallback,
  similar: boolean,
  vars: FormatVars
): UnbindFormatChanged => {
  if (registeredFormatListeners.get() === null) {
    setup(registeredFormatListeners, editor);
  }

  addListeners(editor, registeredFormatListeners, formats, callback, similar, vars);

  return {
    unbind: () => removeListeners(registeredFormatListeners, formats, callback)
  };
};

export {
  formatChangedInternal
};

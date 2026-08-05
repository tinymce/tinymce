export const CARD_LAYOUT = {
  SPACE_BETWEEN: 'space-between',
  FLEX_START: 'flex-start'
} as const;

export const CARD_HIGHLIGHT_TYPE = {
  ADDED: 'added',
  DELETED: 'deleted',
  MODIFIED: 'modified'
} as const;

export const CARD_HEADER_ACTIONS_VISIBILITY = {
  ALWAYS: 'always',
  HOVER: 'hover',
  FOCUS: 'focus'
} as const;

export type CardLayout = typeof CARD_LAYOUT[keyof typeof CARD_LAYOUT];
export type CardHighlightType = typeof CARD_HIGHLIGHT_TYPE[keyof typeof CARD_HIGHLIGHT_TYPE];
export type CardHeaderActionsVisibility = typeof CARD_HEADER_ACTIONS_VISIBILITY[keyof typeof CARD_HEADER_ACTIONS_VISIBILITY];

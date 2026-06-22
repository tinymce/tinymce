
export interface TooltipTriggerRef {
  readonly get: () => string | null;
  readonly set: (value: string | null) => void;
  readonly subscribe: (callback: () => void) => () => void;
}

export interface UniverseResources {
  readonly getIcon: (name: string) => string;
  readonly currentTooltipTrigger: TooltipTriggerRef;
};

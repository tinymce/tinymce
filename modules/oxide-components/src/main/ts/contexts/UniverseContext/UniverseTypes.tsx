
export interface UniverseResources {
  readonly getIcon: (name: string) => string;
}

export interface Universe extends UniverseResources {
  readonly currentTooltipId: string | null;
  readonly setCurrentTooltipId: (id: string | null) => void;
};

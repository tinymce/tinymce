export interface Height {
  readonly unit: 'rows' | 'px';
  readonly value: number;
};

export interface RowMetrics {
  readonly lineHeight: number;
  readonly padding: number;
};

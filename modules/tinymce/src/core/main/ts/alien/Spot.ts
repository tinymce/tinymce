export interface SpotPoint<T> {
  readonly container: T;
  readonly offset: number;
}

const point = <T>(container: T, offset: number): SpotPoint<T> => ({
  container,
  offset
});

export {
  point
};

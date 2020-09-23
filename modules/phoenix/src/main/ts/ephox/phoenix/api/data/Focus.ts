export interface Focus<E> {
  readonly left: any; // TODO narrow types
  readonly element: E;
  readonly right: any;
}

export const Focus = <E>(left: any, element: E, right: any): Focus<E> => ({
  left,
  element,
  right
});

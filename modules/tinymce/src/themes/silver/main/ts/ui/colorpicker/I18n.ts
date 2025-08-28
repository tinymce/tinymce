export interface RawString {
  raw: string;
}

type Primitive = string | number | boolean | Record<string | number, any> | Function;

export type TokenisedString = [ string, ...Primitive[] ];

export type Untranslated = Primitive | TokenisedString | RawString | null | undefined;

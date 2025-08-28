import { Just, Nothing } from './Maybes';

// The Maybe type, representing a value that either does or doesn't exist. For
// a series of functions that you can use on this Maybe type, check out
// `Maybes.ts`.
export type Maybe<T> = Nothing | Just<T>;
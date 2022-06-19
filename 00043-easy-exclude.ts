/*
Implement the built-in Exclude<T, U>
> Exclude from T those types that are assignable to U
*/

/* ----- Your Answer (START) ----- */

type MyExclude<T, U> = T extends U ? never : T

/* ----- Your Answer (END) ----- */

import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<MyExclude<'a' | 'b' | 'c', 'a'>, Exclude<'a' | 'b' | 'c', 'a'>>>,
  Expect<Equal<MyExclude<'a' | 'b' | 'c', 'a' | 'b'>, Exclude<'a' | 'b' | 'c', 'a' | 'b'>>>,
  Expect<Equal<MyExclude<string | number | (() => void), Function>, Exclude<string | number | (() => void), Function>>>,
]

/*
Implement a generic `TupleToUnion<T>` which covers the values of a tuple to its values union.

For example

```ts
type Arr = ['1', '2', '3']

type Test = TupleToUnion<Arr> // expected to be '1' | '2' | '3'
```
*/

/* ----- Your Answer (START) ----- */

type TupleToUnion<T> = T extends [infer F, ...infer R]
  ? F | TupleToUnion<R>
  : never

/* ----- Your Answer (END) ----- */

import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<TupleToUnion<[123, '456', true]>, 123 | '456' | true>>,
  Expect<Equal<TupleToUnion<[123]>, 123>>,
]

/*
Implement the generic version of ```Array.push```

For example

```typescript
type Result = Push<[1, 2], '3'> // [1, 2, '3']
```
*/

/* ----- Your Answer (START) ----- */

type Push<T extends any[], U> = [...T, U]

/* ----- Your Answer (END) ----- */

import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<Push<[], 1>, [1]>>,
  Expect<Equal<Push<[1, 2], '3'>, [1, 2, '3']>>,
  Expect<Equal<Push<['1', 2, '3'], boolean>, ['1', 2, '3', boolean]>>,
]

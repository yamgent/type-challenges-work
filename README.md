# type-challenges-work

## Scripts

### Attempting a Question

You can use `yarn watch` or `yarn build` to check whether your answer passed or not.

```sh
# use this to ask tsc to watch your changes
yarn watch 00013-warm-hello-world.ts

# one-time verification of your answer
yarn build 00013-warm-hello-world.ts
```

### Verifying All Attempts

This will only check files that have been attempted. Files that are not touched (i.e. same as the original question's `template.ts`) will be ignored.

```sh
yarn testAll
```

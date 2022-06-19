# type-challenges-work

## Scripts

### Attempting a Question

When attempting a question, you can use `_watch.mjs` to run your answer with tsc's watch mode enabled.

Alternatively, if you like to do the compilation the manual way, try using `_run.mjs`.

**Note**: If your answer does not exist, the scripts will automatically help you copy the template code for the question to your working folder, and you can attempt it immediately.

```sh
# with watch
node _watch.mjs 00013-warm-hello-world.ts

# without watch
node _run.mjs 00013-warm-hello-world.ts
```

### Checking All Answer Passed

Useful if there's any updates to questions' testcases, run `_testAll.mjs` to run all test cases and ensure that your answers still work.

```sh
node _testAll.mjs
```

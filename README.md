# sf-globalentry-watcher

A simple script to check for SFO GlobalEntry interview timeslots.

## Setup

1. `npm install`
2. `npm run dev` or `ts-node-esm src/index`

## Cron setup

1. Add a file called `cron-runnable.sh` with these contents:

```sh
#!/usr/bin/env sh
PATH=PASTE_PATH_HERE
npm run dev
```

2. Run `echo $PATH`, copy and paste the output to the second line of `cron-runnable.sh`

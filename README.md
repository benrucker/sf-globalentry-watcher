<img width="300" align="right" src="https://github.com/benrucker/sf-globalentry-watcher/assets/12519846/0f73e883-ce71-4768-89d0-5fa2ff19c6dd" />

# SFO GlobalEntry Watcher

A simple script to check for SFO GlobalEntry interview timeslots.

People sometimes cancel their interviews, leaving a new opening for someone else to schedule themselves into. Most openings are snapped up within a few minutes (or faster). So I recommend opening the [TTP login page](https://ttp.cbp.dhs.gov/) and babysitting the script for a few hours while doing something else on your computer. Be ready to act the moment a good time opens up!

There are other tools out there that do the same thing, but they cost money :(

# Usage

This script is built to check for availability once per minute and log the results to a Discord webhook. The reason for sending it to Discord was for push notification support!

## Setup

1. `npm install`
2. Make a file called `.env`
3. Set your Discord webhook URL to the environment variable `WEBHOOK_URL` in that file:

```sh
WEBHOOK_URL="https://discord.com/api/webhooks/<CHANNEL ID>/<TOKEN>"
```

4. Run with `npm run dev` or `ts-node-esm src/index`

## Cron setup

> Instructions for automatically checking the status every minute.

1. Make a file called `cron-runnable.sh` with these contents:

```sh
#!/usr/bin/env sh
PATH=PASTE_PATH_HERE
npm run dev
```

2. Run `echo $PATH`, copy and paste the output to the second line of `cron-runnable.sh`
   - `cron` doesn't use your user's path when executing commands, despite using your user's permissions level
3. Run `crontab -e`
4. Enter something like this line:

```sh
* * * * *      cd /absolute/path/to/sf-globalentry-watcher && ./cron-runnable.sh > /tmp/ge-watcher.log 2>&1
# The asterisks mean "At every minute, run the command"
# You could instead change them to `0 * * * *` which would mean "On every hour, run the command"
```

5. Live monitor the script output with `watch /tmp/ge-watcher.log`

> You don't have to use `cron`, of course - feel free to run this in a loop in your terminal. Just don't DoS the server; you know how fragile government websites can be!

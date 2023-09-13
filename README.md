<img width="300" align="right" src="https://github.com/benrucker/sf-globalentry-watcher/assets/12519846/0f73e883-ce71-4768-89d0-5fa2ff19c6dd" />

# SFO GlobalEntry Watcher

A simple script to check for SFO GlobalEntry interview timeslots.

People sometimes cancel their interviews, leaving a new opening for someone else to schedule themselves into. Most openings are snapped up within a few minutes (or faster). So I recommend opening the [TTP login page](https://ttp.cbp.dhs.gov/) and babysitting the script for a few hours while doing something else on your computer. Be ready to act the moment a good time opens up!

There are other tools out there that do the same thing, but they cost money :(

# Usage

This script is built to check for availability once per minute and log the results to a Discord webhook. The reason for sending it to Discord was for push notification support!

## Setup

1. Clone this repository

```sh
git clone https://github.com/benrucker/sf-globalentry-watcher
```

2. Navigate to the repo

```sh
cd sf-globalentry-watcher
```

3. Install the dependencies

```sh
npm install
```

4. Make a new file called `.env`
5. Generate a Discord webhook URL
   1. Right click a text channel and click "Edit Channel"
   2. Go to "Integrations" -> "Webhooks" -> "New Webhook" -> "Copy Webhook URL"
6. Paste the URL in `.env` following `WEBHOOK_URL=` (with quotes around it)

```sh
WEBHOOK_URL="https://discord.com/api/webhooks/<CHANNEL ID>/<TOKEN>"
```

8. Testrun the application

```sh
npm run dev
# or
ts-node-esm src/index
```

9. The program should hit the API and send a message to the webhook with a time (like `"Next slot: Wed Sep 13 2023 at 7:30 AM"`) or a notice that no times are available (like `"No time slot available"`)

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

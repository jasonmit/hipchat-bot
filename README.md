# Hipchat bot built on node.js
### Built as a very quick hack to add notification alerts over hipchat for ember blog posts and updates.

## Prerequisites

* NodeJS: If you don't have nodejs, please [install it first](http://nodejs.org/download/).  If you're using OSX, [Homebrew](http://brew.sh/) is highly recommended for managing node and other dependencies.

## FAQs

* How do I use this?  Simple.
  * Rename `conf/hipbot_sample.json` to `conf/hipbot.json`
  * Open `conf/hipbot.json` and insert your hipchat API (v2) key
  * `npm install`; `npm start`
  * Sit back and wait.  Whenever emberjs.com updates their blog or releases a new stable build, your hipchat channel will be alerted


## TODO
* Add better error handling
* Add documentation on how to build scrapers and actions
* Unit Tests

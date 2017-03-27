const watchman = require('fb-watchman');

function logInfo(args) {
  console.info.apply(console, ['[WATCH]'].concat(args));
}

function logWarning(args) {
  console.warn.apply(console, ['[WATCH] WARNING'].concat(args));
}

function handleFatalError(args) {
  console.error.apply(console, ['[WATCH] ERROR'].concat(args));
  process.exit(1);
}

function handleSubscriptionCreation(error, response) {
  if (error) {
    handleFatalError('failed to subscribe: ', error);

    return;
  }
  logInfo(`subscription ${response.subscribe} established`);
}

function createClient() {
  const client = new watchman.Client();

  client.on('end', () => {
    logInfo('client ended');
  });

  client.on('error', (error) => {
    console.log(error);
    handleFatalError('Error while talking to watchman: ', error);
  });

  return client;
}

function checkCapabilities(client) {
  client.capabilityCheck({required:['wildmatch']}, (error, response) => {
    if (error) {
      handleFatalError(
        'Error checking capabilities',
        error,
        'Please "brew install watchman" and make sure your watchman version is up to date'
      );

      return;
    }

    logInfo('Talking to watchman version', response.version);
  });
}

function createSubscriptions(client, dirsAndExtensions) {
  client.command(['watch-project', process.cwd()], (error, response) => {
    if (error) {
      handleFatalError('Error initiating watch:', error);

      return;
    }

    if (response.warning) {
      logWarning(response.warning);
    }

    dirsAndExtensions.forEach(([dir, extension]) => {
      client.command(['subscribe', process.cwd(), `directory:${dir}:extension:${extension}`, {
        expression: ['allof',
          ['dirname', dir],
          ['type', 'f'],
          ['not', 'empty'],
          ['suffix', extension]
        ],
        fields: ['name', 'mtime_ms', 'exists']
      }], handleSubscriptionCreation)
    });
  });
}

function watchDirectories(dirsAndExtensions, onChange) {
  const client = createClient();
  checkCapabilities(client);
  createSubscriptions(client, dirsAndExtensions);

  // When the watcher boots up, it'll trigger an event for each subscription
  // that exists. This debounce ensures that we only fire one event at startup.
  const bootupDebounceThreshold = dirsAndExtensions.length;
  let bootupDebounceCounter = 0;

  client.on('subscription', (response) => {
    bootupDebounceCounter++;

    if (bootupDebounceCounter >= bootupDebounceThreshold) {
      onChange(response);
    }
  });
}

watchDirectories.logInfo = logInfo;

module.exports = watchDirectories;

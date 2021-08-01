const VERSION_PREFIX = '0.0.';
const BUILD_NUMBER_START = Math.trunc(1627273740 / 60);

const now = new Date();

const buildNumber = Math.trunc(now.getTime() / 1000 / 60) - BUILD_NUMBER_START;

const suffix = now.toISOString().replace(/[-:T]/g, '').substr(2, 10);

console.log(`::set-output name=BUILD_NUMBER::${buildNumber}`);
console.log(`::set-output name=APP_VERSION::${VERSION_PREFIX}${suffix}`);

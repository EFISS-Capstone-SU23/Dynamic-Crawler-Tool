import optimist from 'optimist';

const DEV_MOD = 'dev' in optimist.argv;
const MAX_INSTANCE = optimist.argv['max-instance'] || 1;
const CONTINUE = 'continue' in optimist.argv;
const TEMPLATE = optimist.argv.template;
const HEADLESS = optimist.argv.headless === undefined ? true : optimist.argv.headless;

export {
	DEV_MOD,
	MAX_INSTANCE,
	CONTINUE,
	TEMPLATE,
	HEADLESS,
};

import { defineConfig } from 'rollup';
import { buildConfig } from '../../scripts/build-config.mjs';

const configs = buildConfig({ packageName: 'dnhyxc-demo' });

export default defineConfig(configs);

import { defineConfig } from 'rollup';
import { buildConfig } from '../../scripts/build-config.mjs';

const configs = buildConfig({ packageName: 'dnhyxcTools' });

export default defineConfig(configs);

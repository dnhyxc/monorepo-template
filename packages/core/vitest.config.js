import { defineConfig } from 'vitest/config';
import { vitestConfig } from '../../scripts/vitest-config.mjs';

const config = vitestConfig({ folder: 'core' });

export default defineConfig(config);

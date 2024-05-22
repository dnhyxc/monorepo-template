import { defineConfig } from 'vitest/config';
import { vitestConfig } from '../../scripts/vitest-config.mjs';

const config = vitestConfig({ folder: 'demo' });

export default defineConfig(config);

#!/usr/bin/env node
/**
 * Simple script to run the seed without relying on npm/npx
 */
require('dotenv').config({ path: '../../.env' });
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs'
  }
});

require('./prisma/seed.ts');

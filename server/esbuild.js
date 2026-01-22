const esbuild = require('esbuild');
const path = require('path');

esbuild
    .build({
        entryPoints: ['src/index.ts'],
        bundle: true,
        platform: 'node',
        target: 'node16',
        outfile: 'build/bundle.js',
        minify: process.env.IS_DEV ? false : true,
        external: [
            '@prisma/client',
            '.prisma/client',
            '@prisma/client/runtime/library',
        ],
        format: 'cjs',
    })
    .catch(() => process.exit(1));

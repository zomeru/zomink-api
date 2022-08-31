module.exports = {
  // Supports all esbuild.build options
  esbuild: {
    minify: false,
    target: 'es2015',
  },
  // Prebuild hook
  prebuild: async () => {
    console.log('prebuild');
    const rimraf = (await import('rimraf')).default;
    rimraf.sync('./dist'); // clean up dist folder
  },
  // Postbuild hook
  postbuild: async () => {
    console.log('postbuild');
    const cpy = (await import('cpy')).default;
    await cpy(
      [
        'src/**/*.graphql', // Copy all .graphql files
        '!src/**/*.{tsx,ts,js,jsx}', // Ignore already built files
      ],
      'dist'
    );
  },
};

module.exports = {
  env: {
    node: true,
    commonjs: true,
    es6: true
  },
  extends: ['airbnb-base', 'prettier'], // 'eslint-config-prettier' disable the conflicting formatting rules with eslint
  plugins: ['prettier'], // 'eslint-plugin-prettier' allows to run prettier from eslint
  rules: {
    'prettier/prettier': 'error',
    'import/no-unresolved': 'off', // Allowing module-alias depedency to work
    'no-console': 'off' // Temporary rule
  }
}

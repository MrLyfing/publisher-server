module.exports = {
  env: {
    node: true,
    commonjs: true,
    es6: true
  },
  extends: ['standard', 'prettier'], // 'eslint-config-prettier' disable the conflicting formatting rules with eslint
  plugins: ['prettier'], // 'eslint-plugin-prettier' allows to enable prettier rules in eslint
  rules: {
    'prettier/prettier': 'error' // display prettier error from eslint
    // 'no-console': 'off' // Temporary rule
  }
}

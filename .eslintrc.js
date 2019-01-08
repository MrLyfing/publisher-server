module.exports = {
  env: {
    node: true,
    commonjs: true,
    es6: true
  },
  extends: ['airbnb-base', 'prettier'], // 'eslint-config-prettier' disable the conflicting formatting rules with eslint
  plugins: ['prettier'], // 'eslint-plugin-prettier' allows to enable prettier rules in eslint
  rules: {
    'prettier/prettier': 'error', // display prettier error from eslint
    'import/no-unresolved': 'off', // Allowing module-alias depedency to work with node
    'no-unused-vars': ['error', { argsIgnorePattern: '^_$' }],

    'no-console': 'off' // Temporary rule
  }
}

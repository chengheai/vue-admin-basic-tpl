/*
 * @Author: Alex
 * @Date: 1984-01-24 16:00:00
 */
/**
 *  在VueCli3.0 中使用Lodash
 *  https://www.jianshu.com/p/e6334d2e7e8c
 */

const plugins = [
  'lodash',
  '@babel/plugin-proposal-nullish-coalescing-operator',
  '@babel/plugin-proposal-optional-chaining'
];

if (process.env.VUE_APP_ENV === 'production') {
  plugins.push('transform-remove-console');
}

module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins
};

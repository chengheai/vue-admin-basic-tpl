module.exports = {
  extends: [
    '@commitlint/config-conventional'
  ],
  // type(必需) 、scope(可选) 和 subject(必需)
  rules: {
    'type-enum': [2, 'always', [ // 类型枚举
      'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'revert', 'chore', 'build'
    ]],
    'scope-case': [2, 'never'],
    'subject-full-stop': [2, 'never'], // 结尾不加 .
    'header-max-length': [2, 'always', 72] // 头部最长字符72
  }
}

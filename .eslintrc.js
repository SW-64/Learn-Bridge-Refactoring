// .eslintrc.js
module.exports = {
    plugins: ['import'],
    rules: {
      'import/extensions': ['error', 'always', {
        js: 'always',
      }]
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx']
        }
      }
    }
  }
  
'use strict';
const path = require('path');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const name = 'vue-admin-basic-tpl'; // page title
const port = 9527; // dev port

function resolve(dir) {
  return path.join(__dirname, dir);
}

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: './',
  outputDir: process.env.OUTPUT_DIR,
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  devServer: {
    host: '0.0.0.0',
    port: port,
    open: false,
    overlay: {
      warnings: false,
      errors: true
    },
    before: require('./mock/mock-server.js')
    // proxy: {
    //   '/api': {
    //     target: 'http://xxx.com',
    //     changeOrigin: true,
    //     pathRewrite: {
    //       [`^/api`]: ''
    //     }
    //   }
    // }
  },
  configureWebpack: {
    name: name,
    resolve: {
      extensions: ['.js', '.vue', '.css', '.json'], // 自动匹配 index.js index.vue index.css
      alias: {
        '@': resolve('src')
      }
    }
  },

  // ref: https://github.com/neutrinojs/webpack-chain
  chainWebpack(config) {
    // https://github.com/PanJiaChen/vue-element-admin/issues/2690
    // runtime 内联请求报错404
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // to ignore runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ]);


    config.plugins.delete('prefetch'); // TODO: need test

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end();

    // icons
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end();

    /**
     *  开发环境
     *  https://webpack.js.org/configuration/devtool/#development
     */
    config.when(process.env.NODE_ENV !== 'development', cfg => cfg.devtool('hidden-source-map'));

    config.plugin('define').tap(args => {
      const baseEnvs = args[0]['process.env'];
      args[0]['process.env'] = {
        ...baseEnvs,
        SENTRY_RELEASE: JSON.stringify(
          require('child_process')
            .execSync('git rev-parse HEAD')
            .toString()
            .trim()
        )
      };
      return args;
    });

    /**
     *  非开发环境
     */
    config.when(process.env.VUE_APP_ENV !== 'development', cfg => {
      // 优化lodash
      cfg.plugin('loadshReplace').use(new LodashModuleReplacementPlugin());

      cfg
        .plugin('ScriptExtHtmlWebpackPlugin')
        .after('html')
        .use('script-ext-html-webpack-plugin', [
          {
            // `runtime` must same as runtimeChunk name. default is `runtime`
            inline: /runtime\..*\.js$/
          }
        ])
        .end();

      cfg.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial' // only package third parties that are initially dependent
          },
          elementUI: {
            name: 'chunk-elementUI', // split elementUI into a single package
            priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true
          }
        }
      });

      cfg.optimization.runtimeChunk('single');
    });
  }
};

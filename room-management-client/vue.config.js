// vue.config.js
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  chainWebpack: config => {
    config.plugin('define').tap(definitions => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      });
      return definitions;
    });
  },
  devServer: {
    client: {
      overlay: {
        warnings: false
        // errors: false
      }
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 你的后端地址
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': '/api' // 保持路径不变
        }
      }
    }
  }
})
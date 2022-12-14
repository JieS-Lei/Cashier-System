import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: [//配置别名
      { find: '~', replacement: resolve(__dirname, 'src') }
    ]
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '^/proxy': {
        target: 'https://vip.jingtoo.cn/index.php?s=/api',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/proxy/, ''),
      }
    }
  }
})

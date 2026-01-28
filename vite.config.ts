import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode, command }) => {
  const isDev = command === 'serve'

  console.log('mode:', mode, 'command:', command)

  /** 公共配置（dev / prod 都要） */
  const common = {
    plugins: [
      vue(),
      vueDevTools(),
      Components({
        dirs: ['src/components'],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }

  /** 开发环境配置 */
  const devConfig = {
    server: {
      port: 5202,
      open: true,
    },
  }

  /** 生产环境配置 */
  const prodConfig = {
    build: {
      outDir: 'build',
      assetsDir: 'static',
    },
  }

  return {
    ...common,
    ...(isDev ? devConfig : prodConfig),
  }
})

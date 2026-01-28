import { defineConfig ,loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import { fileURLToPath, URL } from 'node:url'


export default defineConfig(({ mode, command }) => {

  //拿到环境变量
  const env = loadEnv(mode, process.cwd())
  console.log(env.VITE_APP_NAME)
  console.log(env.VITE_API_BASE_URL)
  console.log(env.VITE_DEBUG)

  const isDev = command === 'serve'

  console.log('mode:', mode, 'command:', command)

  // CDN 配置：从环境变量读取 CDN 地址，如果没有则使用相对路径
  // 开发环境：不使用 CDN（空字符串或相对路径）
  // 生产环境：使用环境变量 VITE_CDN_URL，例如：https://cdn.example.com
  const cdnUrl = env.VITE_CDN_URL || ''
  const base = isDev ? '/' : (cdnUrl ? `${cdnUrl}/` : '/')

  /** 公共配置（dev / prod 都要） */
  const common = {
    // CDN 基础路径配置
    base: base,
    plugins: [
      vue(),
      vueDevTools(),
      Components({
        dirs: ['src/components'],  // 只自动导入 components 目录，views 目录通过路由导入
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
    build: {
      sourcemap: false, // 开发环境生成 sourcemap
    },
  }

  /** 生产环境配置 */
  const prodConfig = {
    build: {
      // outDir: 'build',
      assetsDir: 'static',
      sourcemap: true, // 生产环境也生成 sourcemap（可选：true | 'inline' | 'hidden' | false）
      rollupOptions: {
        output: { 
          // 手动分包策略
          manualChunks(id: string) {
            // 1. 将 node_modules 中的依赖单独打包
            if (id.includes('node_modules')) {
              // Vue 核心库单独打包（vue, vue-router, pinia）
              if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
                return 'vue-vendor'
              }
              
              // 其他第三方库打包到一起
              return 'vendor'
            }
            
            // 2. 业务代码保持自动分包（路由懒加载会自动分包）
            // 如果需要手动控制业务代码分包，可以这样：
            // if (id.includes('/src/views/')) {
            //   const match = id.match(/\/src\/views\/(.+?)\.vue/)
            //   if (match) {
            //     return `view-${match[1]}`
            //   }
            // }
          },
          
          // 文件命名规则（可选，默认已经很好）
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        },
      },
    },
  }

  // 打印 CDN 配置信息（便于调试）
  if (!isDev) {
    console.log('📦 CDN 配置:', cdnUrl ? `使用 CDN: ${cdnUrl}` : '使用相对路径（未配置 CDN）')
  }

  return {
    ...common,
    ...(isDev ? devConfig : prodConfig),
  }
})

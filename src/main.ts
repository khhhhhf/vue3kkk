import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

console.log('import.meta.env:', import.meta.env);

window.__NODE_ENV__ = 'asdjasdhs'

// 把环境变量挂到 window 上，方便在浏览器控制台访问
// @ts-ignore
// window.__ENV__ = import.meta.env

//注入到浏览器
console.log(import.meta.env.VITE_APP_NAME)
console.log(import.meta.env.VITE_API_BASE_URL)
console.log(import.meta.env.VITE_DEBUG)
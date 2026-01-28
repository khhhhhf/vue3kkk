import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import HomeView from '@/views/HomeView.vue'  // 首屏组件，同步加载

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      children: [
        {
          path: '',  // 空路径，匹配 / 时直接显示 HomeView，URL 保持在 /
          name: 'homeView',
          component: HomeView,//同步加载
          // component: () => import('@/views/HomeView.vue')//异步加载
        },
        {
          path: 'aboutview',
          name: 'aboutView',
          component: () => import('@/views/AboutView.vue')
        }
      ]
    },
    {
      path: '/study',
      name: 'study',
      component: () => import('@/views/Study.vue')
    }
  ]
})

export default router

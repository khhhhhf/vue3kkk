import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      children: [
        {
          path: 'homeview',  // /about
          name: 'homeView',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: 'aboutview',
          name: 'aboutView',
          component: () => import('@/views/AboutView.vue'),
        }
      ]
    },
    {
      path: '/study',  // /study 是一级路由
      name: 'study',
      component: () => import('@/views/Study.vue'),  // 独立显示 Study 页面
    }
  ],
})

export default router

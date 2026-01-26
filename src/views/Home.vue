<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'

import HomeView from '@/views/HomeView.vue';
import AboutView from '@/views/AboutView.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <RouterLink to="/HomeView">Home</RouterLink> Home 是外层路由
      <RouterLink to="/AboutView">About</RouterLink> About 是 Home 的子路由
    </div>
  </header>

  <!-- 渲染匹配到的路由组件 -->
  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
}
</style>

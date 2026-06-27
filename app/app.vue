<script setup lang="ts">
const route = useRoute()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'zh-CN'
  }
})

const title = '识字乐园 - 汉字学习'
const description = '专为小朋友设计的汉字学习乐园'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})

const tabs = [
  { label: '认字', icon: 'i-lucide-book-open', to: '/' },
  { label: '复习', icon: 'i-lucide-refresh-cw', to: '/review' },
  { label: '汉字', icon: 'i-lucide-grid-2x2', to: '/my-characters' },
  { label: '设置', icon: 'i-lucide-settings', to: '/settings' }
]

const showTabBar = computed(() => {
  const path = route.path
  // Hide on login, learn, and character detail pages
  if (path === '/login') return false
  if (path === '/learn') return false
  if (path.startsWith('/character/')) return false
  return true
})

function isTabActive(tabTo: string) {
  if (tabTo === '/') return route.path === '/'
  return route.path.startsWith(tabTo)
}
</script>

<template>
  <UApp>
    <div :class="{ 'pb-20': showTabBar }">
      <NuxtPage />
    </div>

    <!-- Bottom Tab Bar -->
    <Transition name="slide-up">
      <div
        v-if="showTabBar"
        class="tab-bar"
      >
        <nav>
          <NuxtLink
            v-for="tab in tabs"
            :key="tab.to"
            :to="tab.to"
            class="tab-bar-item"
            :class="{ active: isTabActive(tab.to) }"
          >
            <UIcon
              :name="tab.icon"
              class="tab-icon"
            />
            <span>{{ tab.label }}</span>
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </UApp>
</template>

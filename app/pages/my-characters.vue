<script setup lang="ts">
interface Character {
  id: string
  seq: number
  char: string
  pinyin: string
  words: string
  sentence: string
  status: number
}

interface Stats {
  total: number
  pending: number
  known: number
  familiar: number
  unknown: number
  todayCount: number
}

const activeTab = ref('all')
const page = ref(1)
const pageSize = 200

const tabItems = [
  { label: '全部', value: 'all' },
  { label: '认识', value: '1' },
  { label: '熟悉', value: '2' },
  { label: '不认识', value: '3' }
]

// Build query params
const queryParams = computed(() => {
  const params: Record<string, string | number> = {
    page: page.value,
    pageSize
  }
  if (activeTab.value !== 'all') {
    params.status = activeTab.value
  }
  return params
})

// Fetch characters
const { data, refresh, status: fetchStatus } = useFetch<{ characters: Character[], total: number }>('/api/characters/list', {
  key: 'my-characters',
  params: queryParams,
  watch: [queryParams]
})

const characters = computed(() => data.value?.characters ?? [])
const total = computed(() => data.value?.total ?? 0)
const hasMore = computed(() => characters.value.length < total.value)

// Fetch stats for tab counts
const { data: stats } = useFetch<Stats>('/api/characters/stats', {
  key: 'my-chars-stats'
})

function getTabLabel(tab: { label: string, value: string }) {
  if (!stats.value) return tab.label
  switch (tab.value) {
    case 'all': return `${tab.label} (${stats.value.total})`
    case '1': return `${tab.label} (${stats.value.known})`
    case '2': return `${tab.label} (${stats.value.familiar})`
    case '3': return `${tab.label} (${stats.value.unknown})`
    default: return tab.label
  }
}

function statusClass(status: number) {
  return `char-cell-${status}`
}

function onTabChange(value: string) {
  activeTab.value = value
  page.value = 1
}

function loadMore() {
  page.value++
}

function goToCharacter(id: string) {
  navigateTo(`/character/${id}`)
}
</script>

<template>
  <div class="max-w-7xl mx-auto w-full px-4 md:px-8 pt-6 pb-24">
    <h1 class="text-2xl font-bold text-orange-700 mb-4 text-center">我的汉字 📚</h1>

    <!-- Tabs -->
    <div class="flex gap-1.5 sm:gap-2 mb-5 overflow-x-auto pb-1 justify-between sm:justify-start">
      <button
        v-for="tab in tabItems"
        :key="tab.value"
        class="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-1 sm:flex-none text-center"
        :class="activeTab === tab.value
          ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
          : 'bg-white/80 text-stone-500 hover:bg-orange-50 border border-stone-200'"
        @click="onTabChange(tab.value)"
      >
        {{ getTabLabel(tab) }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="fetchStatus === 'pending'" class="text-center py-12">
      <div class="text-4xl mb-3 bounce-gentle">📚</div>
      <p class="text-stone-400 text-sm">加载中...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="characters.length === 0" class="text-center py-12">
      <div class="text-5xl mb-3">📭</div>
      <p class="text-stone-400">这里还没有汉字</p>
    </div>

    <!-- Character Grid -->
    <div v-else>
      <div class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
        <div
          v-for="ch in characters"
          :key="ch.id"
          class="char-cell"
          :class="statusClass(ch.status)"
          @click="goToCharacter(ch.id)"
        >
          {{ ch.char }}
        </div>
      </div>

      <!-- Total count -->
      <p class="text-center text-xs text-stone-400 mt-4">共 {{ total }} 个字</p>

      <!-- Load more -->
      <div v-if="hasMore" class="text-center mt-4">
        <UButton variant="soft" size="lg" class="rounded-xl" @click="loadMore">
          加载更多
        </UButton>
      </div>
    </div>
  </div>
</template>

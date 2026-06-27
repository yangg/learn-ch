<script setup lang="ts">
interface Stats {
  total: number
  pending: number
  known: number
  familiar: number
  unknown: number
  todayCount: number
  nickname: string
}

const { data: stats, refresh } = useFetch<Stats>('/api/characters/stats', {
  key: 'home-stats'
})

// Refresh stats when navigating back to this page
onActivated(() => refresh())

const progressPercent = computed(() => {
  if (!stats.value || stats.value.total === 0) return 0
  return Math.round((stats.value.known / stats.value.total) * 100)
})

const statCards = computed(() => [
  {
    label: '认识',
    icon: 'i-lucide-check-circle',
    value: stats.value?.known ?? 0,
    colorClass: 'stat-green',
    iconColor: 'text-emerald-500'
  },
  {
    label: '熟悉',
    icon: 'i-lucide-star',
    value: stats.value?.familiar ?? 0,
    colorClass: 'stat-amber',
    iconColor: 'text-amber-500'
  },
  {
    label: '不认识',
    icon: 'i-lucide-x-circle',
    value: stats.value?.unknown ?? 0,
    colorClass: 'stat-red',
    iconColor: 'text-red-500'
  },
  {
    label: '待确认',
    icon: 'i-lucide-help-circle',
    value: stats.value?.pending ?? 0,
    colorClass: 'stat-gray',
    iconColor: 'text-stone-400'
  }
])
</script>

<template>
  <div class="max-w-5xl mx-auto w-full px-4 md:px-8 pt-6 pb-24">
    <!-- Title -->
    <div class="text-center mb-6">
      <h1 class="text-2xl font-bold text-orange-700">
        {{ stats?.nickname || 'brook' }} 的识字乐园 ✨
      </h1>
      <p class="text-stone-400 text-sm mt-1">
        每天认几个字，积少成多
      </p>
    </div>

    <!-- Progress Bar -->
    <div
      v-if="stats"
      class="warm-card p-4 mb-6"
    >
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-stone-600">学习进度</span>
        <span class="text-sm font-semibold text-orange-600">{{ stats.known }} / {{ stats.total }}</span>
      </div>
      <UProgress
        :model-value="progressPercent"
        size="lg"
      />
      <p class="text-xs text-stone-400 mt-1.5 text-right">
        {{ progressPercent }}%
      </p>
    </div>

    <!-- Stat Cards Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="stat-card"
        :class="card.colorClass"
      >
        <UIcon
          :name="card.icon"
          :class="card.iconColor"
          class="text-2xl mb-1"
        />
        <div class="text-2xl font-bold text-stone-700">
          {{ card.value }}
        </div>
        <div class="text-xs text-stone-500 font-medium">
          {{ card.label }}
        </div>
      </div>
    </div>

    <!-- Today's count -->
    <div
      v-if="stats"
      class="text-center mb-6"
    >
      <div class="warm-card inline-flex items-center gap-2 px-5 py-2.5">
        <span class="text-lg">📅</span>
        <span class="text-sm text-stone-600">今天已学</span>
        <span class="text-xl font-bold text-orange-600">{{ stats.todayCount }}</span>
        <span class="text-sm text-stone-600">个字</span>
      </div>
    </div>

    <!-- Start Learning Button -->
    <NuxtLink
      to="/learn"
      class="block"
    >
      <button class="action-btn action-btn-amber w-full text-xl pulse-glow">
        开始认字 📖
      </button>
    </NuxtLink>
  </div>
</template>

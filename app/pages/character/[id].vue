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

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const charId = computed(() => route.params.id as string)

const { data: char, refresh } = useFetch<Character>(() => `/api/characters/${charId.value}`, {
  key: `character-${charId.value}`
})

const statusLabels: Record<number, string> = {
  0: '待确认',
  1: '认识',
  2: '熟悉',
  3: '不认识'
}

const statusOptions = [
  { label: '认识 ✅', value: 1 },
  { label: '熟悉 ⭐', value: 2 },
  { label: '不认识 ❌', value: 3 }
]

async function changeStatus(newStatus: number) {
  if (!char.value) return
  await $fetch('/api/characters/progress', {
    method: 'POST',
    body: { character_id: char.value.id, status: newStatus }
  })
  await refresh()
}

// Navigate to prev/next by seq
async function goPrev() {
  if (!char.value) return
  const prevSeq = char.value.seq - 1
  if (prevSeq < 1) return
  // Fetch character list to find prev ID
  try {
    const data = await $fetch<{ characters: Character[] }>('/api/characters/list', {
      params: { page: 1, pageSize: 1, seq: prevSeq }
    })
    if (data && data.characters && data.characters.length > 0) {
      const firstChar = data.characters[0]
      if (firstChar) {
        await navigateTo(`/character/${firstChar.id}`)
      }
    }
  } catch {
    // Silently handle
  }
}

async function goNext() {
  if (!char.value) return
  const nextSeq = char.value.seq + 1
  try {
    const data = await $fetch<{ characters: Character[] }>('/api/characters/list', {
      params: { page: 1, pageSize: 1, seq: nextSeq }
    })
    if (data && data.characters && data.characters.length > 0) {
      const firstChar = data.characters[0]
      if (firstChar) {
        await navigateTo(`/character/${firstChar.id}`)
      }
    }
  } catch {
    // Silently handle
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="min-h-screen px-4 pt-4 pb-8">
    <div class="w-full px-4 md:px-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <button @click="goBack" class="flex items-center gap-1 text-stone-400 hover:text-orange-600 transition-colors">
          <UIcon name="i-lucide-arrow-left" class="text-xl" />
          <span class="text-sm">返回</span>
        </button>
        <span v-if="char" class="text-xs text-stone-400">第 {{ char.seq }} 个</span>
      </div>

      <!-- Loading -->
      <div v-if="!char" class="text-center py-20">
        <div class="text-4xl mb-3 bounce-gentle">📖</div>
        <p class="text-stone-400 text-sm">加载中...</p>
      </div>

      <!-- Character detail -->
      <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <!-- Left column: Character & basic info -->
        <div class="md:col-span-5 text-center flex flex-col items-center">
          <div class="py-4 w-full">
            <div class="tian-zi-ge mx-auto">
              <div class="char-display">{{ char.char }}</div>
            </div>
          </div>

          <div class="pinyin-display my-3">{{ char.pinyin }}</div>

          <div class="flex items-center justify-center gap-3 mb-6">
            <span class="status-badge" :class="`status-badge-${char.status}`">
              {{ statusLabels[char.status] }}
            </span>
            <USelect
              :model-value="char.status"
              :items="statusOptions"
              value-key="value"
              size="sm"
              class="w-32"
              @update:model-value="changeStatus"
            />
          </div>
        </div>

        <!-- Right column: Vocab, sentences, navigation -->
        <div class="md:col-span-7 space-y-6">
          <!-- Words -->
          <div>
            <h3 class="text-sm font-medium text-stone-400 mb-2">词组</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(word, idx) in char.words.split(/[,，、]/).filter(Boolean)"
                :key="idx"
                class="word-tag"
              >
                {{ word.trim() }}
              </span>
            </div>
          </div>

          <!-- Sentence -->
          <div v-if="char.sentence">
            <h3 class="text-sm font-medium text-stone-400 mb-2">例句</h3>
            <div class="warm-card p-4 text-left">
              <p class="text-stone-600 text-base leading-relaxed">{{ char.sentence }}</p>
            </div>
          </div>

          <!-- Prev / Next buttons -->
          <div class="flex gap-3 pt-4">
            <button
              class="action-btn flex-1 bg-stone-100 text-stone-600 hover:bg-stone-200"
              @click="goPrev"
            >
              ← 上一个
            </button>
            <button
              class="action-btn flex-1 bg-stone-100 text-stone-600 hover:bg-stone-200"
              @click="goNext"
            >
              下一个 →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

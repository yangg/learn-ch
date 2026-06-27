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

const router = useRouter()

// State
const characters = ref<Character[]>([])
const currentIndex = ref(0)
const showResult = ref(false)
const showHint = ref(false)
const hintUsed = ref(false)
const loading = ref(true)
const submitting = ref(false)
const groupStats = ref({ known: 0, familiar: 0, unknown: 0 })
const completed = ref(false)
const noCharacters = ref(false)

// Current character
const currentChar = computed(() => characters.value[currentIndex.value])

// Progress text
const progressText = computed(() => `${currentIndex.value + 1} / ${characters.value.length}`)

// Hint text
const hintText = computed(() => {
  if (!currentChar.value) return ''
  const words = currentChar.value.words.split(/[,，、]/).map(w => w.trim()).filter(Boolean)
  if (words.length === 0) return ''
  const word = words[0]
  return word.replace(new RegExp(currentChar.value.char, 'g'), '___')
})

// Status labels
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

// Fetch review batch
async function fetchBatch() {
  loading.value = true
  try {
    const settings = await $fetch('/api/settings')
    const batchSize = settings.batchSize || 20

    const data = await $fetch(`/api/characters/review-batch?count=${batchSize}`)
    if (data.characters && data.characters.length > 0) {
      characters.value = data.characters
      currentIndex.value = 0
      showResult.value = false
      showHint.value = false
      hintUsed.value = false
      completed.value = false
      groupStats.value = { known: 0, familiar: 0, unknown: 0 }
    } else {
      noCharacters.value = true
    }
  } catch {
    noCharacters.value = true
  } finally {
    loading.value = false
  }
}

// Select status
async function selectStatus(status: number) {
  if (!currentChar.value || submitting.value) return
  submitting.value = true

  try {
    await $fetch('/api/characters/progress', {
      method: 'POST',
      body: { character_id: currentChar.value.id, status }
    })

    currentChar.value.status = status

    if (status === 1) groupStats.value.known++
    else if (status === 2) groupStats.value.familiar++
    else if (status === 3) groupStats.value.unknown++

    showResult.value = true
  } catch {
    // Silently handle
  } finally {
    submitting.value = false
  }
}

// Change status via dropdown
async function changeStatus(newStatus: number) {
  if (!currentChar.value) return

  const oldStatus = currentChar.value.status
  if (oldStatus === 1) groupStats.value.known--
  else if (oldStatus === 2) groupStats.value.familiar--
  else if (oldStatus === 3) groupStats.value.unknown--

  if (newStatus === 1) groupStats.value.known++
  else if (newStatus === 2) groupStats.value.familiar++
  else if (newStatus === 3) groupStats.value.unknown++

  currentChar.value.status = newStatus

  await $fetch('/api/characters/progress', {
    method: 'POST',
    body: { character_id: currentChar.value.id, status: newStatus }
  })
}

// Show hint
function toggleHint() {
  showHint.value = true
  hintUsed.value = true
}

// Next character
function nextChar() {
  if (currentIndex.value < characters.value.length - 1) {
    currentIndex.value++
    showResult.value = false
    showHint.value = false
    hintUsed.value = false
  } else {
    completed.value = true
  }
}

// Go back
function goBack() {
  router.push('/')
}

// Start another round
function startAgain() {
  noCharacters.value = false
  fetchBatch()
}

onMounted(() => {
  fetchBatch()
})
</script>

<template>
  <div class="min-h-screen px-4 pt-4 pb-8">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="text-5xl mb-4 bounce-gentle">🔄</div>
        <p class="text-stone-400">正在准备复习...</p>
      </div>
    </div>

    <!-- No characters to review -->
    <div v-else-if="noCharacters" class="flex items-center justify-center min-h-screen">
      <div class="text-center celebrate">
        <div class="text-7xl mb-4">🌟</div>
        <h2 class="text-2xl font-bold text-orange-700 mb-2">太棒了！</h2>
        <p class="text-stone-500 mb-6">没有需要复习的字</p>
        <UButton size="xl" class="rounded-xl" @click="goBack">返回首页</UButton>
      </div>
    </div>

    <!-- Completed group -->
    <div v-else-if="completed" class="flex items-center justify-center min-h-screen">
      <div class="text-center celebrate max-w-sm mx-auto">
        <div class="text-7xl mb-4">🏆</div>
        <h2 class="text-2xl font-bold text-orange-700 mb-4">复习完成！</h2>

        <!-- Group stats -->
        <div class="grid grid-cols-3 gap-3 mb-6">
          <div class="stat-card stat-green">
            <div class="text-2xl font-bold text-emerald-600">{{ groupStats.known }}</div>
            <div class="text-xs text-stone-500">认识</div>
          </div>
          <div class="stat-card stat-amber">
            <div class="text-2xl font-bold text-amber-600">{{ groupStats.familiar }}</div>
            <div class="text-xs text-stone-500">熟悉</div>
          </div>
          <div class="stat-card stat-red">
            <div class="text-2xl font-bold text-red-600">{{ groupStats.unknown }}</div>
            <div class="text-xs text-stone-500">不认识</div>
          </div>
        </div>

        <div class="space-y-3">
          <button class="action-btn action-btn-amber w-full" @click="startAgain">
            继续复习 🔄
          </button>
          <UButton size="lg" variant="ghost" class="rounded-xl w-full" @click="goBack">
            返回首页
          </UButton>
        </div>
      </div>
    </div>

    <!-- Review flow -->
    <div v-else class="max-w-lg mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <button @click="goBack" class="flex items-center gap-1 text-stone-400 hover:text-orange-600 transition-colors">
          <UIcon name="i-lucide-arrow-left" class="text-xl" />
          <span class="text-sm">返回</span>
        </button>
        <div class="text-center">
          <span class="text-xs text-stone-400 block">复习时间 🔄</span>
          <span class="text-sm font-semibold text-orange-600">{{ progressText }}</span>
        </div>
        <!-- Status dropdown -->
        <div v-if="showResult && currentChar" class="relative">
          <USelect
            :model-value="currentChar.status"
            :items="statusOptions"
            value-key="value"
            size="sm"
            class="w-28"
            @update:model-value="changeStatus"
          />
        </div>
        <div v-else class="w-28" />
      </div>

      <!-- Character display -->
      <Transition name="char-card" mode="out-in">
        <div :key="currentIndex" class="text-center">
          <div class="py-8">
            <div class="char-display mx-auto">{{ currentChar?.char }}</div>
          </div>

          <!-- Before answer -->
          <div v-if="!showResult">
            <!-- Hint -->
            <Transition name="fade">
              <div v-if="showHint" class="mb-6">
                <div class="warm-card inline-block px-5 py-3">
                  <span class="text-lg text-stone-600">{{ hintText }}</span>
                </div>
              </div>
            </Transition>

            <!-- Action buttons -->
            <div class="flex gap-3 mb-4">
              <button
                class="action-btn action-btn-green flex-1"
                :disabled="submitting"
                @click="selectStatus(1)"
              >
                认识
              </button>
              <button
                v-if="!hintUsed"
                class="action-btn action-btn-amber flex-1"
                :disabled="submitting"
                @click="selectStatus(2)"
              >
                熟悉
              </button>
              <button
                class="action-btn action-btn-red flex-1"
                :disabled="submitting"
                @click="selectStatus(3)"
              >
                不认识
              </button>
            </div>

            <!-- Hint button -->
            <button
              v-if="!showHint"
              class="text-sm text-orange-500 hover:text-orange-700 transition-colors font-medium"
              @click="toggleHint"
            >
              给点提示 💡
            </button>
          </div>

          <!-- After answer -->
          <Transition name="slide-up">
            <div v-if="showResult && currentChar" class="space-y-4">
              <div>
                <span class="status-badge" :class="`status-badge-${currentChar.status}`">
                  {{ statusLabels[currentChar.status] }}
                </span>
              </div>

              <div class="pinyin-display">{{ currentChar.pinyin }}</div>

              <div class="flex flex-wrap gap-2 justify-center">
                <span
                  v-for="(word, idx) in currentChar.words.split(/[,，、]/).filter(Boolean)"
                  :key="idx"
                  class="word-tag"
                >
                  {{ word.trim() }}
                </span>
              </div>

              <div v-if="currentChar.sentence" class="warm-card p-4 text-left">
                <p class="text-stone-600 text-base leading-relaxed">{{ currentChar.sentence }}</p>
              </div>

              <button class="action-btn action-btn-amber w-full mt-4" @click="nextChar">
                {{ currentIndex < characters.length - 1 ? '下一个 →' : '查看结果 🏆' }}
              </button>
            </div>
          </Transition>
        </div>
      </Transition>
    </div>
  </div>
</template>

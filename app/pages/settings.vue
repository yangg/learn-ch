<script setup lang="ts">
const toast = useToast()
const router = useRouter()

// Settings
const { data: settings, refresh: refreshSettings } = useFetch<{ batchSize: number; nickname: string }>('/api/settings', {
  key: 'settings'
})

const batchSize = ref(20)
const savingBatchSize = ref(false)

const nickname = ref('')
const savingNickname = ref(false)

// Sync settings from server
watch(settings, (val) => {
  if (val) {
    batchSize.value = val.batchSize
    nickname.value = val.nickname
  }
}, { immediate: true })

async function saveBatchSize() {
  savingBatchSize.value = true
  try {
    await $fetch('/api/settings', {
      method: 'PUT',
      body: { batchSize: batchSize.value }
    })
    toast.add({ title: '已保存', description: '每组字数已更新', color: 'success' })
    await refreshSettings()
  } catch {
    toast.add({ title: '保存失败', color: 'error' })
  } finally {
    savingBatchSize.value = false
  }
}

async function saveNickname() {
  savingNickname.value = true
  try {
    await $fetch('/api/settings', {
      method: 'PUT',
      body: { nickname: nickname.value }
    })
    toast.add({ title: '已保存', description: '昵称已更新', color: 'success' })
    await refreshSettings()
  } catch {
    toast.add({ title: '保存失败', color: 'error' })
  } finally {
    savingNickname.value = false
  }
}

// Import
const isDesktop = ref(false)
const importText = ref('')
const importing = ref(false)
const importResult = ref<{ imported: number, total: number } | null>(null)

onMounted(() => {
  const ua = navigator.userAgent
  isDesktop.value = !/Android|iPhone|iPad|iPod|Mobile/i.test(ua)
})

async function handleImport() {
  if (!importText.value.trim()) return
  importing.value = true
  importResult.value = null

  try {
    const result = await $fetch('/api/characters/import', {
      method: 'POST',
      body: { text: importText.value }
    })
    importResult.value = result
    importText.value = ''
    toast.add({
      title: '导入成功',
      description: `导入了 ${result.imported} / ${result.total} 个字`,
      color: 'success'
    })
  } catch {
    toast.add({ title: '导入失败', color: 'error' })
  } finally {
    importing.value = false
  }
}

// Logout
const loggingOut = ref(false)

async function handleLogout() {
  loggingOut.value = true
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await navigateTo('/login')
  } catch {
    toast.add({ title: '退出失败', color: 'error' })
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto w-full px-4 md:px-8 pt-6 pb-24">
    <h1 class="text-2xl font-bold text-orange-700 mb-6 text-center">设置 ⚙️</h1>

    <!-- Nickname setting -->
    <div class="warm-card p-5 mb-5">
      <label class="block text-sm font-medium text-stone-600 mb-2">我的昵称</label>
      <p class="text-xs text-stone-400 mb-3">识字乐园里显示的名称</p>
      <div class="flex items-center gap-3">
        <UInput
          v-model="nickname"
          placeholder="请输入你的昵称..."
          size="lg"
          class="flex-1"
        />
        <UButton
          :loading="savingNickname"
          size="lg"
          class="rounded-xl"
          @click="saveNickname"
        >
          保存
        </UButton>
      </div>
    </div>

    <!-- Batch size setting -->
    <div class="warm-card p-5 mb-5">
      <label class="block text-sm font-medium text-stone-600 mb-2">每组字数</label>
      <p class="text-xs text-stone-400 mb-3">每次学习或复习的汉字数量</p>
      <div class="flex items-center gap-3">
        <UInput
          v-model.number="batchSize"
          type="number"
          :min="5"
          :max="50"
          size="lg"
          class="flex-1"
        />
        <UButton
          :loading="savingBatchSize"
          size="lg"
          class="rounded-xl"
          @click="saveBatchSize"
        >
          保存
        </UButton>
      </div>
    </div>

    <!-- Import section (desktop only) -->
    <div v-if="isDesktop" class="warm-card p-5 mb-5">
      <label class="block text-sm font-medium text-stone-600 mb-2">导入汉字</label>
      <p class="text-xs text-stone-400 mb-3">粘贴 CSV 格式的汉字数据</p>
      <UTextarea
        v-model="importText"
        placeholder="粘贴汉字数据..."
        :rows="6"
        class="w-full mb-3"
      />

      <!-- Import result -->
      <div v-if="importResult" class="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
        <p class="text-sm text-emerald-700">
          ✅ 成功导入 {{ importResult.imported }} / {{ importResult.total }} 个字
        </p>
      </div>

      <UButton
        :loading="importing"
        :disabled="!importText.trim()"
        size="lg"
        block
        class="rounded-xl"
        @click="handleImport"
      >
        导入
      </UButton>
    </div>

    <!-- Logout -->
    <div class="mt-10">
      <UButton
        :loading="loggingOut"
        color="error"
        variant="outline"
        size="lg"
        block
        class="rounded-xl"
        @click="handleLogout"
      >
        退出登录
      </UButton>
    </div>
  </div>
</template>

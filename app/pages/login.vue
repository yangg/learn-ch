<script setup lang="ts">
definePageMeta({
  layout: false
})

const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!password.value) return
  loading.value = true
  error.value = ''

  try {
    const result = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { password: password.value }
    })

    if (result.success) {
      await navigateTo('/')
    } else {
      error.value = '密码不对哦，再试试吧 🤔'
    }
  } catch {
    error.value = '登录失败，请稍后再试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <div class="login-card w-full max-w-sm text-center">
      <!-- Title -->
      <div class="mb-8">
        <div class="text-5xl mb-3 bounce-gentle">🌈</div>
        <h1 class="text-3xl font-bold text-orange-700">识字乐园</h1>
        <p class="text-stone-400 mt-1 text-sm">快来认字吧！</p>
      </div>

      <!-- Username display -->
      <div class="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 border border-amber-100">
        <UIcon name="i-lucide-user" class="text-orange-400 text-lg" />
        <span class="text-stone-600 font-medium">brook</span>
      </div>

      <!-- Password input -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <UInput
          v-model="password"
          type="password"
          placeholder="请输入密码"
          size="xl"
          icon="i-lucide-lock"
          class="w-full"
        />

        <!-- Error message -->
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <!-- Login button -->
        <UButton
          type="submit"
          :loading="loading"
          size="xl"
          block
          class="rounded-xl text-lg font-semibold"
        >
          进入乐园 🚀
        </UButton>
      </form>
    </div>
  </div>
</template>

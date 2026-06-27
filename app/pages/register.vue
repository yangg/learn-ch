<script setup lang="ts">
definePageMeta({
  layout: false
})

const username = ref('')
const password = ref('')
const invitationCode = ref('')
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  if (!username.value || !password.value || !invitationCode.value) {
    error.value = '请填写所有字段'
    return
  }
  loading.value = true
  error.value = ''

  try {
    const result = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value,
        invitationCode: invitationCode.value
      }
    })

    if (result.success) {
      await navigateTo('/')
    }
  } catch (e: any) {
    error.value = e?.data?.statusMessage || '注册失败，请稍后再试'
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
        <div class="text-5xl mb-3 bounce-gentle">
          ✨
        </div>
        <h1 class="text-3xl font-bold text-orange-700">
          加入乐园
        </h1>
        <p class="text-stone-400 mt-1 text-sm">
          创建你的账号
        </p>
      </div>

      <!-- Register form -->
      <form
        class="space-y-4"
        @submit.prevent="handleRegister"
      >
        <UInput
          v-model="username"
          type="text"
          placeholder="请输入用户名"
          size="xl"
          icon="i-lucide-user"
          class="w-full"
        />

        <UInput
          v-model="password"
          type="password"
          placeholder="请输入密码"
          size="xl"
          icon="i-lucide-lock"
          class="w-full"
        />

        <UInput
          v-model="invitationCode"
          type="text"
          placeholder="请输入邀请码"
          size="xl"
          icon="i-lucide-ticket"
          class="w-full"
        />

        <!-- Error message -->
        <p
          v-if="error"
          class="text-red-500 text-sm"
        >
          {{ error }}
        </p>

        <!-- Register button -->
        <UButton
          type="submit"
          :loading="loading"
          size="xl"
          block
          class="rounded-xl text-lg font-semibold"
        >
          注册 🎉
        </UButton>
      </form>

      <!-- Login link -->
      <p class="mt-6 text-sm text-stone-400">
        已有账号？
        <NuxtLink
          to="/login"
          class="text-orange-500 font-medium hover:text-orange-600"
        >
          去登录
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

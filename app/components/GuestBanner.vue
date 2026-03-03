<template>
  <div
    v-if="isGuest"
    class="sticky top-0 z-[100] bg-orange-500/10 border-b border-orange-500/20 backdrop-blur-xl px-4 py-2"
  >
    <div class="max-w-275 mx-auto flex items-center justify-center gap-3">
      <UIcon name="i-lucide-alert-triangle" class="size-4 text-orange-400 shrink-0" />
      <p class="text-xs font-medium text-orange-200/80 text-center leading-relaxed">
        {{ $t('auth.guestWarning') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isGuest } = useAuth()
</script>

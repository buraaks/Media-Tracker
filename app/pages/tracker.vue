<template>
  <div class="h-screen flex flex-col overflow-hidden bg-[#1a1a1a]">
    <TheHeader class="shrink-0" />
    <main class="flex-1 overflow-hidden relative">
      <NuxtPage v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </NuxtPage>
    </main>
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

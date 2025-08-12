<script setup lang="ts">
import { NConfigProvider, NGlobalStyle, NMessageProvider, NModalProvider } from 'naive-ui';

import Main from './components/main-view/Main.vue';
import ModalProvider from './components/modal-provider/ModalProvider.vue';
import { onBeforeMount } from 'vue';

onBeforeMount(() => {
  localStorage.clear();
});
</script>

<template>
  <NConfigProvider>
    <NModalProvider>
      <NMessageProvider>
        <ModalProvider />
        <NGlobalStyle />
        <Main />
      </NMessageProvider>
    </NModalProvider>
  </NConfigProvider>
</template>

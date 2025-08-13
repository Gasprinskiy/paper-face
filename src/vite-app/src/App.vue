<script setup lang="ts">
import { NConfigProvider, NGlobalStyle, NMessageProvider, NModalProvider } from 'naive-ui';

import Main from './components/main-view/Main.vue';
import ModalProvider from './components/modal-provider/ModalProvider.vue';
</script>

<template>
  <NConfigProvider>
    <NModalProvider>
      <NMessageProvider placement="bottom" :duration="3000">
        <ModalProvider />
        <NGlobalStyle />
        <Main />
      </NMessageProvider>
    </NModalProvider>
  </NConfigProvider>
</template>

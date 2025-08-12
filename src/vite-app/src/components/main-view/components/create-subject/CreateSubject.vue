<script lang="ts" setup>
import { NButton, NCard, NDivider, NInput, NScrollbar } from 'naive-ui';
import { ref, shallowRef, toRaw } from 'vue';

import { declineWord } from '@/packages/name_decl';
import { deepClone } from '@/packages/object';
import type { SubjectOption } from '@/shared/types';
import { useSubjectsListStorage } from '@/composables/storage';

import { ActionNames } from '../../constants';
import { ActionMode } from '../../types';

const subjectsList = useSubjectsListStorage();

const nameVal = shallowRef<string>('');
const list = ref<SubjectOption[]>(deepClone(toRaw(subjectsList.value)));

async function addName() {
  const trimName = nameVal.value.trim();
  const nameDeclension = await declineWord(trimName, 'dative');

  subjectsList.value = [...subjectsList.value, {
    name: trimName,
    declension: nameDeclension,
  }];

  list.value = subjectsList.value;
}

async function onRedact(index: number, value: SubjectOption) {
  let nameDeclension = value.declension;

  const trimName = value.name.trim();
  if (trimName !== subjectsList.value[index].name && value.declension !== subjectsList.value[index].declension) {
    nameDeclension = await declineWord(value.name, 'genitive');
  }

  subjectsList.value[index] = {
    name: trimName,
    declension: nameDeclension,
  };

  list.value[index] = subjectsList.value[index];
}

function onRemove(removeIndex: number, removeValue: SubjectOption) {
  const filtered = subjectsList.value.filter((value, index) => index !== removeIndex && value.name !== removeValue.name);

  subjectsList.value = filtered;
  list.value = filtered;
}
</script>

<template>
  <div class="create-subject-view">
    <h2>{{ ActionNames[ActionMode.SUBJECTS] }}</h2>

    <form
      class="create-subject-view__form"
      @submit.prevent="addName"
    >
      <NInput
        v-model:value="nameVal"
        placeholder="Название предмета"
      />

      <div class="create-subject-view__add-btn">
        <NButton
          type="primary"
          attr-type="submit"
        >
          Добавить
        </NButton>
      </div>
    </form>

    <NDivider />

    <NScrollbar style="max-height: 400px;">
      <div class="create-subject-view__list">
        <NCard
          v-for="(value, index) in list"
          :key="index"
        >
          <form
            class="create-subject-view__form"
            @submit.prevent="onRedact(index, value)"
          >
            <div class="app-input">
              <span>Название предмета</span>
              <NInput
                v-model:value="value.name"
                placeholder="Название предмета"
              />
            </div>

            <div class="app-input">
              <span>Сколнение</span>
              <NInput
                v-model:value="value.declension"
                placeholder="Склонение"
              />
            </div>

            <div class="create-subject-view__redact-btn">
              <NButton
                type="error"
                @click="onRemove(index, value)"
              >
                Удалить
              </NButton>
              <NButton
                type="primary"
                attr-type="submit"
              >
                Сохранить
              </NButton>
            </div>
          </form>
        </NCard>
      </div>
    </NScrollbar>
  </div>
</template>

<style lang="scss" src="./style.scss" />

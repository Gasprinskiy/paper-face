<script lang="ts" setup>
import { NButton, NCard, NInput, NScrollbar, NSelect } from 'naive-ui';
import { computed, ref, shallowRef, toRaw } from 'vue';
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface';

import { declineWord } from '@/packages/name_decl';
import { deepClone } from '@/packages/object';
import type { NameOption } from '@/shared/types';
import { Gender } from '@/shared/types';
import { useNamesListStorage } from '@/composables/storage';

import { ActionNames } from '../../constants';
import { ActionMode } from '../../types';

const nameList = useNamesListStorage();

const nameVal = shallowRef<string>('');
const genderVal = shallowRef<Gender>();
const list = ref<NameOption[]>(deepClone(toRaw(nameList.value)));

const genderOptions = computed<SelectMixedOption[]>(() => {
  return Object.keys(Gender).map((key: string): SelectMixedOption => {
    return {
      value: key,
      label: Gender[key as keyof typeof Gender],
    };
  });
});

async function addName() {
  const trimName = nameVal.value.trim();
  const nameDeclension = await declineWord(trimName, 'genitive');

  nameList.value = [...nameList.value, {
    name: trimName,
    declension: nameDeclension,
    gender: genderVal.value || Gender.MALE,
  }];

  list.value = nameList.value;
}

async function onRedact(index: number, value: NameOption) {
  const trimName = value.name.trim();
  const nameDeclension = await declineWord(value.name, 'genitive');

  nameList.value[index] = {
    name: trimName,
    declension: nameDeclension,
    gender: value.gender,
  };

  list.value[index] = nameList.value[index];
}

function onRemove(removeIndex: number, removeValue: NameOption) {
  const filtered = nameList.value.filter((value, index) => index !== removeIndex && value.name !== removeValue.name);

  nameList.value = filtered;
  list.value = filtered;
}
</script>

<template>
  <div class="create-name-view">
    <h2>{{ ActionNames[ActionMode.NAMES] }}</h2>

    <form
      class="create-name-view__form"
      @submit.prevent="addName"
    >
      <NInput
        v-model:value="nameVal"
        placeholder="Фамилия и Имя"
      />

      <NSelect
        v-model:value="genderVal"
        placeholder="Пол"
        :options="genderOptions"
      />

      <div class="create-name-view__add-btn">
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
      <div class="create-name-view__list">
        <NCard
          v-for="(value, index) in list"
          :key="index"
        >
          <form
            class="create-name-view__form"
            @submit.prevent="onRedact(index, value)"
          >
            <div class="app-input">
              <span>Фамилия и Имя</span>
              <NInput
                v-model:value="value.name"
                placeholder="Фамилия и Имя"
              />
            </div>

            <div class="app-input">
              <span>Сколнение</span>
              <NInput
                v-model:value="value.declension"
                placeholder="Фамилия и Имя"
              />
            </div>

            <div class="app-input">
              <span>Пол</span>
              <NSelect
                v-model:value="value.gender"
                placeholder="Пол"
                :options="genderOptions"
              />
            </div>

            <div class="create-name-view__redact-btn">
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

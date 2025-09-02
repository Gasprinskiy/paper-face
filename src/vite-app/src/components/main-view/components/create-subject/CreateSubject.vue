<script lang="ts" setup>
import { NButton, NDivider, NIcon, NInput, NScrollbar, NSelect, NTable, useMessage } from 'naive-ui';
import { SaveOutline, TrashBinOutline } from '@vicons/ionicons5';
import { required } from '@vuelidate/validators';
import { computed, ref, shallowRef, toRaw } from 'vue';

import { declineWord } from '@/packages/name_decl';
import { deepClone } from '@/packages/object';
import { LangCode } from '@/shared/types';
import type { SubjectOption } from '@/shared/types';
import { useSubjectsListStorage } from '@/composables/storage';

import { ActionNames } from '../../constants';
import { ActionMode } from '../../types';
import useVuelidate from '@vuelidate/core';
import { LangOptions } from './constants';

const message = useMessage();
const subjectsList = useSubjectsListStorage();

const nameVal = shallowRef<string>('');
const langCode = shallowRef<LangCode>(LangCode.RU);
const list = ref<SubjectOption[]>(deepClone(toRaw(subjectsList.value)));

const isLangCodeRu = computed<boolean>(() => langCode.value === LangCode.RU);

const validatos = {
  name: { required },
};

const v$ = useVuelidate(validatos, {
  name: nameVal,
});

async function addName() {
  const valid = await v$.value.$validate();
  if (!valid) {
    message.error('Поле пустое');
    return;
  }

  const uuid = crypto.randomUUID();
  const trimName = nameVal.value.trim();

  let nameDeclension = trimName;
  if (isLangCodeRu.value) {
    try {
      nameDeclension = await declineWord(trimName, 'dative');
    } catch {
      message.error('Ошбика при сколнении слова, возожно вы выбрали не тот язык');
      return;
    }
  }

  subjectsList.value = [...subjectsList.value, {
    id: uuid,
    name: trimName,
    declension: nameDeclension,
    lang_code: langCode.value,
  }];

  list.value = subjectsList.value;

  nameVal.value = '';

  message.success('Предмет добавлен');
}

async function onRedact(index: number, value: SubjectOption) {
  const trimName = value.name.trim();

  let nameDeclension = trimName;
  if (value.lang_code === LangCode.RU) {
    try {
      nameDeclension = await declineWord(value.name, 'dative');
    } catch {
      message.error('Ошбика при сколнении слова, возожно вы выбрали не тот язык');
      return;
    }
  }

  subjectsList.value[index] = {
    id: value.id,
    name: trimName,
    declension: nameDeclension,
    lang_code: value.lang_code,
  };

  list.value[index] = subjectsList.value[index];

  message.success('Изменения сохранены');
}

function onRemove(removeIndex: number, removeValue: SubjectOption) {
  const filtered = subjectsList.value.filter((value, index) => index !== removeIndex && value.id !== removeValue.id);

  subjectsList.value = filtered;
  list.value = filtered;

  message.warning('Предмет удален');
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

      <NSelect
        v-model:value="langCode"
        :options="LangOptions"
        placeholder="Язык"
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

    <NScrollbar style="max-height: 226px;">
      <NTable :single-line="false">
        <thead>
          <tr>
            <th>Название предмета</th>
            <th>Сколнение</th>
            <th>Язык</th>
            <th />
          </tr>
        </thead>

        <tbody
          v-for="(value, index) in list"
          :key="index"
        >
          <td>
            <NInput
              v-model:value="value.name"
              placeholder="Название предмета"
            />
          </td>

          <td>
            <NInput
              v-model:value="value.declension"
              placeholder="Склонение"
              disabled
            />
          </td>

          <td>
            <NSelect
              v-model:value="value.lang_code"
              :options="LangOptions"
              placeholder="Язык"
            />
          </td>

          <td class="create-subject-view__redact-btn">
            <NButton
              type="error"
              @click="onRemove(index, value)"
            >
              <template #icon>
                <NIcon :component="TrashBinOutline" />
              </template>
            </NButton>
            <NButton
              type="primary"
              @click="onRedact(index, value)"
            >
              <template #icon>
                <NIcon :component="SaveOutline" />
              </template>
            </NButton>
          </td>
        </tbody>
      </NTable>
    </NScrollbar>
  </div>
</template>

<style lang="scss" src="./style.scss" />

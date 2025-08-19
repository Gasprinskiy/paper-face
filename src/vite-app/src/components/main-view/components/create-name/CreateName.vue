<script lang="ts" setup>
import { NButton, NDivider, NIcon, NInput, NScrollbar, NSelect, NTable, NUpload, useMessage } from 'naive-ui';
import type { UploadFileInfo } from 'naive-ui';
import { computed, reactive, ref, shallowReactive, shallowRef, toRaw } from 'vue';
import { SaveOutline, TrashBinOutline } from '@vicons/ionicons5';
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface';
import * as XLSX from 'xlsx';

import { declineWord } from '@/packages/name_decl';
import { deepClone } from '@/packages/object';
import type { NameOption } from '@/shared/types';
import { Gender } from '@/shared/types';
import { useNamesListStorage } from '@/composables/storage';

import { ActionNames } from '../../constants';
import { ActionMode } from '../../types';
import { GenderOptions } from './constants';

const message = useMessage();
const nameList = useNamesListStorage();

const nameVal = shallowRef<string>('');
const genderVal = shallowRef<Gender | null>(null);
const list = ref<NameOption[]>(deepClone(toRaw(nameList.value)));

const uploadedFile = shallowRef<UploadFileInfo | null>(null);
const nameRowKey = shallowRef<string>('');
const genderRowKey = shallowRef<string>('');
const genderKeys = shallowReactive<Record<Gender, string>>({
  [Gender.MALE]: '',
  [Gender.FEMALE]: '',
});

const validatos = {
  name: { required },
  gender: { required },
};

const v$ = useVuelidate(validatos, {
  name: nameVal,
  gender: genderVal,
});

const singleFileList = computed<UploadFileInfo[]>({
  get(): UploadFileInfo[] {
    return uploadedFile.value ? [uploadedFile.value] : [];
  },

  set(value: UploadFileInfo[]) {
    uploadedFile.value = value[value.length - 1];
  },
});

async function onCreate() {
  const valid = await v$.value.$validate();
  if (!valid) {
    message.error('Поля пустые или не до конца заполнены');
    return;
  }

  const uuid = crypto.randomUUID();
  const trimName = nameVal.value.trim();
  const nameDeclension = await declineWord(trimName, 'genitive');

  nameList.value = [...nameList.value, {
    id: uuid,
    name: trimName,
    declension: nameDeclension,
    gender: genderVal.value || Gender.MALE,
  }];

  list.value = nameList.value;

  nameVal.value = '';
  genderVal.value = null;

  message.success('Ученик добавлен');
}

async function onRedact(index: number, value: NameOption) {
  const trimName = value.name.trim();
  const nameDeclension = await declineWord(value.name, 'genitive');

  nameList.value[index] = {
    id: value.id,
    name: trimName,
    declension: nameDeclension,
    gender: value.gender,
  };

  list.value[index] = nameList.value[index];

  message.success('Изменения сохранены');
}

function onRemove(removeIndex: number, removeValue: NameOption) {
  const filtered = nameList.value.filter((value, index) => index !== removeIndex && value.name !== removeValue.name);

  nameList.value = filtered;
  list.value = filtered;

  message.warning('Ученик удален');
}

function handleFileUpload() {
  const file = uploadedFile.value?.file;
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (e: any) => {
    const arrayBuffer = e.target.result;
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const array = XLSX.utils.sheet_to_json(worksheet);
    console.log('array: ', array);
  };
  reader.readAsArrayBuffer(file);
}
</script>

<template>
  <div class="create-name-view">
    <h2>{{ ActionNames[ActionMode.NAMES] }}</h2>

    <form
      class="create-name-view__form create-name-view__file-form"
      @submit.prevent="handleFileUpload"
    >
      <NUpload
        v-model:file-list="singleFileList"
        :multiple="false"
        accept=".xlsx"
      >
        <NButton type="info">
          Выбрать .xlsx файл
        </NButton>
      </NUpload>

      <NInput
        v-model:value="nameRowKey"
        placeholder="Укажите заголовок фамилии и имени как в табилице"
      />

      <NInput
        v-model:value="genderRowKey"
        placeholder="Укажите заголовок пола как в табилице"
      />

      <div>
        <NInput
          v-model:value="genderKeys.male"
          placeholder="Укажите значение отвечающая за мужской пол в таблице"
        />

        <NInput
          v-model:value="genderKeys.female"
          placeholder="Укажите значение отвечающая за женский пол в таблице"
        />
      </div>

      <div class="create-name-view__add-btn">
        <NButton
          type="primary"
          attr-type="submit"
        >
          Обработать
        </NButton>
      </div>
    </form>

    <NDivider>Или добавьте в ручную</NDivider>

    <form
      class="create-name-view__form"
      @submit.prevent="onCreate"
    >
      <NInput
        v-model:value="nameVal"
        placeholder="Фамилия и Имя"
      />

      <NSelect
        v-model:value="genderVal"
        placeholder="Пол"
        :options="GenderOptions"
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

    <NScrollbar style="max-height: 226px;">
      <NTable :single-line="false">
        <thead>
          <tr>
            <th>Фамилия и Имя</th>
            <th>Сколнение</th>
            <th>Пол</th>
            <th />
          </tr>
        </thead>

        <tbody
          v-for="(value, index) in list"
          :key="value.id"
        >
          <td>
            <NInput
              v-model:value="value.name"
              placeholder="Фамилия и Имя"
            />
          </td>

          <td>
            <NInput
              v-model:value="value.declension"
              placeholder="Сколнение"
              disabled
            />
          </td>

          <td>
            <NSelect
              v-model:value="value.gender"
              placeholder="Пол"
              :options="GenderOptions"
            />
          </td>

          <td class="create-name-view__redact">
            <div class="create-name-view__redact-btn">
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
            </div>
          </td>
        </tbody>
      </NTable>
    </NScrollbar>
  </div>
</template>

<style lang="scss" src="./style.scss" />

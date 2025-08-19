<script lang="ts" setup>
import { NButton, NDivider, NIcon, NInput, NScrollbar, NSelect, NTable, NUpload, useMessage } from 'naive-ui';
import type { UploadFileInfo } from 'naive-ui';
import { computed, ref, shallowRef, toRaw } from 'vue';
import type { ShallowRef } from 'vue';
import { SaveOutline, TrashBinOutline } from '@vicons/ionicons5';
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';

import { declineWord } from '@/packages/name_decl';
import { deepClone, invertRecord } from '@/packages/object';
import type { NameOption } from '@/shared/types';
import { Gender } from '@/shared/types';
import { useNamesListStorage } from '@/composables/storage';

import { ActionNames } from '../../constants';
import { ActionMode } from '../../types';
import { GenderOptions } from './constants';
import { readExcelFile } from '@/packages/file_reader';

const message = useMessage();
const nameList = useNamesListStorage();

const nameVal = shallowRef<string>('');
const genderVal = shallowRef<Gender | null>(null);
const list = ref<NameOption[]>(deepClone(toRaw(nameList.value)));

const loading = shallowRef<boolean>(false);
const uploadedFile = shallowRef<UploadFileInfo | null>(null);

const nameHeaderKey = shallowRef<string>('');
const genderHeaderKey = shallowRef<string>('');
const genderKeys = shallowRef<Record<Gender, ShallowRef<string>>>({
  [Gender.MALE]: shallowRef<string>(''),
  [Gender.FEMALE]: shallowRef<string>(''),
});

const validators = {
  name: { required },
  gender: { required },
};

const fileValuesValidators = {
  name_key: { required },
  gender_key: { required },
  gender_value_key: {
    [Gender.MALE]: { required },
    [Gender.FEMALE]: { required },
  },
};

const v$ = useVuelidate(validators, {
  name: nameVal,
  gender: genderVal,
});

const v$_file = useVuelidate(fileValuesValidators, {
  name_key: nameHeaderKey,
  gender_key: genderHeaderKey,
  gender_value_key: genderKeys,
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
  const filtered = nameList.value.filter((value, index) => index !== removeIndex && value.id !== removeValue.id);

  nameList.value = filtered;
  list.value = filtered;

  message.warning('Ученик удален');
}

async function handleFileUpload() {
  const file = uploadedFile.value?.file;
  if (!file) {
    message.error('Файл не выбран');
    return;
  }

  const valid = await v$_file.value.$validate();
  if (!valid) {
    message.error('Поля заполнены не полностью');
    return;
  }

  const loadingMessage = message.loading('Ваш файл в обработке, подождите', {
    duration: 0,
  });
  loading.value = true;

  try {
    const array = await readExcelFile<Record<string, string>>(file);
    const processedCount = await processNamesArray(array);
    message.success(`Добавлено ${processedCount} из ${array.length} записей`);
  } catch (e) {
    console.error('excel parse error: ', e);
    message.error('Не удалось прочитать файл');
  } finally {
    loadingMessage.destroy();
    loading.value = false;
  }
}

async function processNamesArray(array: Record<string, string>[]): Promise<number> {
  let count = 0;
  let newArray: NameOption[] = [];

  const invertedGenderKeys = invertRecord({
    [Gender.MALE]: toRaw(genderKeys.value[Gender.MALE].value.trim()),
    [Gender.FEMALE]: toRaw(genderKeys.value[Gender.FEMALE].value.trim()),
  });

  for (const element of array) {
    const name = element[nameHeaderKey.value];
    const genderKey = element[genderHeaderKey.value];
    if (!name || !genderKey) {
      continue;
    }

    const gender = invertedGenderKeys[genderKey];
    if (!gender) {
      continue;
    }

    try {
      const nameDeclension = await declineWord(name.trim(), 'genitive');
      const newValue: NameOption = {
        id: crypto.randomUUID(),
        name: name.trim(),
        declension: nameDeclension,
        gender,
      };

      newArray = [...newArray, newValue];

      count += 1;
    } catch (e) {
      console.error(e);
    }
  }

  nameList.value = [...nameList.value, ...newArray];
  list.value = [...list.value, ...newArray];

  return count;
}
</script>

<template>
  <div class="create-name-view">
    <div v-show="loading" class="create-name-view__skeleton shine-screen" />

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
          Выбрать excel файл
        </NButton>
      </NUpload>

      <NInput
        v-model:value="nameHeaderKey"
        placeholder="Заголовок колонны фамилий и имен как в табилице"
      />

      <NInput
        v-model:value="genderHeaderKey"
        placeholder="Заголовок колонны полов как в табилице"
      />

      <div class="create-name-view__file-form_input-row">
        <NInput
          v-model:value="genderKeys.male.value"
          placeholder="Значение отвечающее за мужской пол в таблице"
        />

        <NInput
          v-model:value="genderKeys.female.value"
          placeholder="Значение отвечающее за женский пол в таблице"
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

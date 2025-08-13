<script lang="ts" setup>
import { NButton, NDivider, NIcon, NInput, NScrollbar, NSelect, NTable, useMessage } from 'naive-ui';
import { ref, shallowRef, toRaw } from 'vue';
import { SaveOutline, TrashBinOutline } from '@vicons/ionicons5';
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface';

import { declineWord } from '@/packages/name_decl';
import { deepClone } from '@/packages/object';
import type { NameOption } from '@/shared/types';
import { Gender } from '@/shared/types';
import { useNamesListStorage } from '@/composables/storage';

import { ActionNames } from '../../constants';
import { ActionMode } from '../../types';
import { GenderNameByKey } from './constants';

const message = useMessage();
const nameList = useNamesListStorage();

const nameVal = shallowRef<string>('');
const genderVal = shallowRef<Gender | null>(null);
const list = ref<NameOption[]>(deepClone(toRaw(nameList.value)));

const validatos = {
  name: { required },
  gender: { required },
};

const v$ = useVuelidate(validatos, {
  name: nameVal,
  gender: genderVal,
});

const genderOptions: SelectMixedOption[] = [
  {
    value: Gender.MALE,
    label: GenderNameByKey[Gender.MALE],
  },
  {
    value: Gender.FEMALE,
    label: GenderNameByKey[Gender.FEMALE],
  },
];

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
</script>

<template>
  <div class="create-name-view">
    <h2>{{ ActionNames[ActionMode.NAMES] }}</h2>

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
              :options="genderOptions"
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

<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { NButton, NDropdown, NIcon, NSelect } from 'naive-ui';
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface';
import { computed, shallowRef } from 'vue';
import type { Component } from 'vue';

import { Pencil } from '@vicons/ionicons5';

import { Gender } from '@/shared/types/names';
import type { NameOption } from '@/shared/types/names';
import type { WindowWithElectronApi } from '@/shared/types/common';
import { useModal } from '@/composables/use_modal';

import { DropDownOptions } from './constants';
import { ActionMode } from './types';
import CreateName from './components/create-name/CreateName.vue';

const nameList = useStorage<NameOption[]>('name_list', [], undefined, {
  serializer: {
    read: (v: string) => v ? JSON.parse(v) : [],
    write: (v: NameOption[]) => JSON.stringify(v),
  },
});
const subjectsList = useStorage<string[]>('subjects_list', [
  'Родной язык',
  'Литературное чтение',
  'Математика',
  'Окружающий мир',
  'Иностранный язык',
  'Физическая культура',
  'Изобразительное искусство',
  'Музыка',
  'Технология',
  'Основы религиозных культур и светской этики',
], undefined, {
  serializer: {
    read: (v: string) => v ? JSON.parse(v) : [],
    write: (v: string[]) => JSON.stringify(v),
  },
});
const { showModal } = useModal();

const nameValue = shallowRef<string[]>(['all']);
const subjectValue = shallowRef<string[]>(['all']);

const nameListOptions = computed<SelectMixedOption[]>(() => {
  const mapedList = nameList.value.map(({ name }) => {
    return {
      label: name,
      value: name,
    };
  });

  return [
    {
      label: 'Все',
      value: 'all',
      default: true,
      disabled: nameValue.value.length > 1,
    },
    ...mapedList,
  ];
});

const subjectListOptions = computed<SelectMixedOption[]>(() => {
  const mapedList = subjectsList.value.map((name) => {
    return {
      label: name,
      value: name,
    };
  });

  return [
    {
      label: 'Все',
      value: 'all',
      default: true,
      disabled: subjectValue.value.length > 1,
    },
    ...mapedList,
  ];
});

function onUpdateNames() {
  // nameValue.value = nameValue.value.filter(item => item !== 'all');
}

function onSubmitCreate() {
  // let names = nameValue.value;
  if (nameValue.value.length > 1) {
    // names = nameValue.value.filter(item => item !== 'all');
  }

  const windowEAPI = window as WindowWithElectronApi;

  const shit = [];
  const className = '3 E';
  for (const element of nameList.value) {
    const genTitle = element.gender === Gender.MALE ? 'ка' : 'цы';

    shit.push({
      subject: subjectsList.value[0],
      genderTitle: genTitle,
      groupName: className,
      name: element.declension,
    });
  }

  windowEAPI.electronAPI?.generatePDFs(shit);
}

function onRedactModeSelect(val: ActionMode) {
  const actions: Record<ActionMode, () => Component> = {
    [ActionMode.NAMES]: () => {
      return CreateName;
    },

    [ActionMode.SUBJECTS]: () => {
      return CreateName;
    },
  };

  const component = actions[val]();

  showModal({
    component,
  });
}
</script>

<template>
  <div class="main-view">
    <div class="main-view__head">
      <h1>Paper Face</h1>
      <NDropdown
        trigger="click"
        :options="DropDownOptions"
        @select="onRedactModeSelect"
      >
        <NButton>
          <template #icon>
            <NIcon
              :component="Pencil"
            />
          </template>
        </NButton>
      </NDropdown>
    </div>

    <form
      class="main-view__form"
      @submit.prevent="onSubmitCreate"
    >
      <div class="main-view__input">
        <span class="main-view__input-label">Выберите учеников</span>
        <NSelect
          v-model:value="nameValue"
          multiple
          :options="nameListOptions"
          @update-value="onUpdateNames"
        />
      </div>

      <div class="main-view__input">
        <span class="main-view__input-label">Выберите предметы</span>
        <NSelect
          v-model:value="subjectValue"
          multiple
          :options="subjectListOptions"
        />
      </div>

      <NButton
        type="primary"
        attr-type="submit"
      >
        Создать
      </NButton>
    </form>
  </div>
</template>

<style lang="scss" src="./style.scss" />

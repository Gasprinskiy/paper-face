<script setup lang="ts">
// @ts-expect-error freakint description
import AppEventBus from '../../../../event-bus/index.js';

import { NButton, NCheckbox, NCheckboxGroup, NDropdown, NIcon, NSelect, useMessage } from 'naive-ui';
import type { MessageReactive } from 'naive-ui';
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface';
import { computed, onMounted, shallowRef } from 'vue';
import type { Component } from 'vue';

import { Pencil } from '@vicons/ionicons5';

import { Gender } from '@/shared/types';
import type { CreateFileNameParam, NameOption, SubjectOption } from '@/shared/types';
import type { WindowWithElectronApi } from '@/shared/types/common';
import { useModal } from '@/composables/use_modal';

import { DropDownOptions, SubjectTypeNames } from './constants';
import { ActionMode, SubjectType } from './types';
import CreateName from './components/create-name/CreateName.vue';
import CreateSubject from './components/create-subject/CreateSubject.vue';
import { useNamesListStorage, useSubjectsListStorage } from '@/composables/storage';
import { declineWord, pluralize } from '@/packages/name_decl';

const message = useMessage();
const nameList = useNamesListStorage();
const subjectsList = useSubjectsListStorage();
const { showModal } = useModal();

const nameValue = shallowRef<string[]>([]);
const subjectValue = shallowRef<string[]>([]);
const subjectTypeValue = shallowRef<SubjectType[]>([SubjectType.DEFAULT]);

const nameListOptions = computed<SelectMixedOption[]>(() => {
  return nameList.value.map(({ name }) => {
    return {
      label: name,
      value: name,
    };
  });
});

const subjectListOptions = computed<SelectMixedOption[]>(() => {
  return subjectsList.value.map(({ name }) => {
    return {
      label: name,
      value: name,
    };
  });
});

function onSubjectTypeUpdate(value: any[]) {
  if (value.length > 0) {
    return;
  }

  subjectTypeValue.value = [SubjectType.DEFAULT];
}

async function onSubmitCreate() {
  // let names = nameValue.value;
  if (nameList.value.length === 0) {
    message.error('Список учеников пуст', {
      duration: 3000,
    });
    return;
  }

  if (subjectsList.value.length === 0) {
    message.error('Список предметов пуст', {
      duration: 3000,
    });
    return;
  }

  let pickedNames: CreateFileNameParam[] = nameList.value.map(({ name, declension, gender }) => {
    return {
      gender_title: gender === Gender.MALE ? 'ка' : 'цы',
      name,
      declension,
    };
  });
  let pickedSubjects: string[] = subjectsList.value.map(({ declension }) => declension);

  if (nameValue.value.length > 0) {
    const listMap = nameList.value.reduce((acc, cur) => {
      if (!acc.has(cur.name)) {
        acc.set(cur.name, cur);
      }

      return acc;
    }, new Map<string, NameOption>());

    pickedNames = nameValue.value.map(name => listMap.get(name)!).map(({ name, declension, gender }) => {
      return {
        gender_title: gender === Gender.MALE ? 'ка' : 'цы',
        name,
        declension,
      };
    }); ;
  }

  if (subjectValue.value.length > 0) {
    const listMap = subjectsList.value.reduce((acc, cur) => {
      if (!acc.has(cur.name)) {
        acc.set(cur.name, cur);
      }

      return acc;
    }, new Map<string, SubjectOption>());

    pickedSubjects = nameValue.value.map(name => listMap.get(name)!).map(({ declension }) => declension); ;
  }

  try {
    const windowEAPI = window as WindowWithElectronApi;
    let subjectTypes: string[] = [];

    for (const element of subjectTypeValue.value) {
      const result = await declineWord(SubjectTypeNames[element], 'genitive', true);
      subjectTypes = [...subjectTypes, result.toLowerCase()];
    }

    windowEAPI.electronAPI?.generatePDFs({
      subjects: pickedSubjects,
      names: pickedNames,
      subjectTypes,
      groupName: '3 Е',
    });
  } catch (e) {
    console.error(e);
  }
}

function onRedactModeSelect(val: ActionMode) {
  const actions: Record<ActionMode, () => Component> = {
    [ActionMode.NAMES]: () => {
      return CreateName;
    },

    [ActionMode.SUBJECTS]: () => {
      return CreateSubject;
    },
  };

  const component = actions[val]();

  showModal({
    component,
  });
}

function onReset() {
  nameValue.value = [];
  subjectValue.value = [];
  subjectTypeValue.value = [SubjectType.DEFAULT];
}

onMounted(() => {
  let loadingMessage: MessageReactive | null = null;

  AppEventBus?.subscribe({
    key: 'on_start',
    callBack: () => {
      loadingMessage = message.loading('Идет создание файлов, это может занять какое-то время');
    },
  });

  AppEventBus?.subscribe({
    key: 'on_done',
    callBack: (count: number) => {
      loadingMessage?.destroy();
      const countPlur = pluralize(count, 'файл', 'файла', 'файлов');
      message.success(`Создано ${count} ${countPlur}`);
    },
  });

  AppEventBus?.subscribe({
    key: 'on_error',
    callBack: () => {
      loadingMessage?.destroy();
      message.success(`Произошла ошибка при создании файлов`);
    },
  });
});
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
          placeholder="По умолчанию выбраны все"
        />
      </div>

      <div class="main-view__input">
        <span class="main-view__input-label">Выберите предметы</span>
        <NSelect
          v-model:value="subjectValue"
          multiple
          :options="subjectListOptions"
          placeholder="По умолчанию выбраны все"
        />
      </div>

      <div class="main-view__checboxes">
        <NCheckboxGroup
          v-model:value="subjectTypeValue"
          @update:value="onSubjectTypeUpdate"
        >
          <NCheckbox
            :value="SubjectType.DEFAULT"
            :label="SubjectTypeNames[SubjectType.DEFAULT]"
          />
          <NCheckbox
            :value="SubjectType.TEST"
            :label="SubjectTypeNames[SubjectType.DEFAULT]"
          />
        </NCheckboxGroup>
      </div>

      <div class="main-view__action-btns">
        <NButton
          type="warning"
          @click="onReset"
        >
          Сбросить
        </NButton>

        <NButton
          type="primary"
          attr-type="submit"
        >
          Создать
        </NButton>
      </div>
    </form>
  </div>
</template>

<style lang="scss" src="./style.scss" />

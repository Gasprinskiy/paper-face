<script setup lang="ts">
import { NButton, NCheckbox, NCheckboxGroup, NDropdown, NIcon, NSelect, useMessage } from 'naive-ui';
import type { MessageReactive } from 'naive-ui';
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface';
import { computed, onMounted, shallowRef, toRaw } from 'vue';
import type { Component } from 'vue';

import { Pencil } from '@vicons/ionicons5';

import type { CreateFileNameParam, NameOption, SubjectOption, SubjectTypeOption } from '@/shared/types';
import type { WindowWithElectronApi } from '@/shared/types/common';
import { useModal } from '@/composables/use_modal';

import { DropDownOptions, GenderPostfixByKey, SubjectTypeNames, SubjectTypeTemplateNames } from './constants';
import { ActionMode, SubjectType } from './types';
import CreateName from './components/create-name/CreateName.vue';
import CreateSubject from './components/create-subject/CreateSubject.vue';
import { useNamesListStorage, useSubjectsListStorage } from '@/composables/storage';
import { declineWord, pluralize } from '@/packages/name_decl';

const message = useMessage();
const nameList = useNamesListStorage();
const subjectsList = useSubjectsListStorage();
const { showModal } = useModal();

const loading = shallowRef<boolean>(false);
const nameValue = shallowRef<string[]>([]);
const subjectValue = shallowRef<string[]>([]);
const subjectTypeValue = shallowRef<SubjectType[]>([SubjectType.DEFAULT]);

const nameListOptions = computed<SelectMixedOption[]>(() => {
  return nameList.value.map(({ id, name }) => {
    return {
      label: name,
      value: id,
    };
  });
});

const subjectListOptions = computed<SelectMixedOption[]>(() => {
  return subjectsList.value.map(({ id, name }) => {
    return {
      label: name,
      value: id,
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
      gender_title: GenderPostfixByKey[gender],
      name,
      declension,
    };
  });
  let pickedSubjects: string[] = subjectsList.value.map(({ declension }) => declension.toLowerCase());

  if (nameValue.value.length > 0) {
    const listMap = nameList.value.reduce((acc, cur) => {
      if (!acc.has(cur.id)) {
        acc.set(cur.id, cur);
      }

      return acc;
    }, new Map<string, NameOption>());

    pickedNames = nameValue.value.map(id => listMap.get(id)!).map(({ name, declension, gender }) => {
      return {
        gender_title: GenderPostfixByKey[gender],
        name,
        declension,
      };
    }); ;
  }

  if (subjectValue.value.length > 0) {
    const listMap = toRaw(subjectsList.value).reduce((acc, cur) => {
      if (!acc.has(cur.id)) {
        acc.set(cur.id, cur);
      }

      return acc;
    }, new Map<string, SubjectOption>());

    pickedSubjects = subjectValue.value.map(id => listMap.get(id)!).map(({ declension }) => declension.toLowerCase());
  }

  try {
    const windowEAPI = window as WindowWithElectronApi;
    let subjectTypes: SubjectTypeOption[] = [];

    for (const element of subjectTypeValue.value) {
      const result = await declineWord(SubjectTypeTemplateNames[element], 'genitive', true);
      subjectTypes = [...subjectTypes, {
        name: SubjectTypeNames[element],
        declension: result,
        type: element,
      }];
    }

    windowEAPI.electronAPI?.generatePDFs({
      subjects: pickedSubjects,
      names: pickedNames,
      subjectTypes,
      groupNumber: 3,
      groupID: 'E',
      schoolNumber: '247',
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

  const windowEAPI = window as WindowWithElectronApi;

  windowEAPI.electronAPI?.on('start', () => {
    loading.value = true;
    loadingMessage = message.loading('Идет создание файлов, это может занять какое-то время', {
      duration: 0,
    });
  });

  windowEAPI.electronAPI?.on('done', (count: number) => {
    loadingMessage?.destroy();
    const countPlur = pluralize(count, 'файл', 'файла', 'файлов');
    message.success(`Создано ${count} ${countPlur}`);
    loading.value = false;
  });

  windowEAPI.electronAPI?.on('error', () => {
    loadingMessage?.destroy();
    message.error(`Произошла ошибка при создании файлов`);
    loading.value = false;
  });
});
</script>

<template>
  <div class="main-view">
    <div v-show="loading" class="main-view__skeleton shine-screen" />
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
            :label="SubjectTypeNames[SubjectType.TEST]"
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

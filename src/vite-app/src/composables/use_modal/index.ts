import { computed, shallowReactive } from 'vue';
import type { UseModalState } from './types';

const state = shallowReactive<UseModalState>({
  component: null,
  props: null,
  emits: null,
});

export function useModal() {
  const isVisible = computed<boolean>(() => state.component !== null);

  function showModal(options: UseModalState) {
    const { component, props, emits } = options;

    state.component = component;
    state.props = props;
    state.emits = emits;
    // state.width = width;
  }

  function closeModal() {
    state.component = null;
    state.props = null;
    state.emits = null;
  }

  return {
    state,
    isVisible,
    showModal,
    closeModal,
  };
}

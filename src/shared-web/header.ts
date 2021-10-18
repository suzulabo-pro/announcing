import { createStore } from '@stencil/store';

type HeaderButtons = { label: string; href?: string; handler?: () => void }[];

const { state } = createStore({ buttons: [] as HeaderButtons });

export const getHeaderButtons = () => {
  return state.buttons;
};

export const setHeaderButtons = (buttons: HeaderButtons) => {
  state.buttons = buttons;
};

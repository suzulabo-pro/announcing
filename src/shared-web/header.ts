import { createStore } from '@stencil/store';

type HeaderButtons = { label: string; href?: string; handler?: () => void }[];

const { state } = createStore({ buttons: [] as HeaderButtons, title: '' });

export const getHeaderButtons = () => {
  return state.buttons;
};

export const setHeaderButtons = (buttons: HeaderButtons) => {
  state.buttons = buttons;
};

export const getHeaderTitle = () => {
  return state.title;
};

export const setHeaderTitle = (title: string) => {
  state.title = title;
};

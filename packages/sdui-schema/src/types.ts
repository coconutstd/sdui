// Server Driven UI — Component Schema
// 서버가 내려주는 컴포넌트 트리의 타입 정의

export type ComponentType =
  | 'text'
  | 'image'
  | 'button'
  | 'stack'
  | 'card'
  | 'list';

export interface BaseComponent {
  id: string;
  type: ComponentType;
}

export interface TextComponent extends BaseComponent {
  type: 'text';
  props: {
    content: string;
    style?: 'heading' | 'body' | 'caption';
  };
}

export interface ImageComponent extends BaseComponent {
  type: 'image';
  props: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

export interface ButtonComponent extends BaseComponent {
  type: 'button';
  props: {
    label: string;
    action: Action;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
}

export interface StackComponent extends BaseComponent {
  type: 'stack';
  props: {
    direction?: 'row' | 'column';
    gap?: number;
    children: Component[];
  };
}

export interface CardComponent extends BaseComponent {
  type: 'card';
  props: {
    children: Component[];
  };
}

export interface ListComponent extends BaseComponent {
  type: 'list';
  props: {
    items: Component[];
  };
}

export type Component =
  | TextComponent
  | ImageComponent
  | ButtonComponent
  | StackComponent
  | CardComponent
  | ListComponent;

// 서버가 내려주는 액션 타입
export type Action =
  | { type: 'navigate'; url: string }
  | { type: 'deeplink'; path: string }
  | { type: 'api_call'; endpoint: string; method: 'GET' | 'POST' };

// 서버 응답 최상위 구조
export interface SDUIScreen {
  version: string;
  screenId: string;
  root: Component;
}

/// <reference types="vite/client" />
import * as ReactImport from 'react';

declare global {
  export namespace React {
    export type RefObject<T> = ReactImport.RefObject<T>;
    export type ComponentPropsWithoutRef<T extends ReactImport.ElementType> = ReactImport.ComponentPropsWithoutRef<T>;
  }
}

declare module '*?raw' {
  const content: string;
  export default content;
}

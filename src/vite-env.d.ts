/// <reference types="vite/client" />

declare module 'figma:asset/*.png' {
  const src: string;
  export default src;
}

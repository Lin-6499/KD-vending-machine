/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module "nprogress";

declare module "sortablejs";

declare module "vue-color-kit";

declare module "@wangeditor/editor-for-vue";

declare module "vue-pick-colors";

declare module "driver.js";

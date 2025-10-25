import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,vue}"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,vue}"],
    languageOptions: { globals: globals.browser }
  },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } }
  },
  {
    rules: {
      // eslint (http://eslint.cn/docs/rules)
      "no-var": "error", // 要求使用 let 或 const 而不是 var
      "no-multiple-empty-lines": ["error", { max: 1 }], // 不允许多个空行
      "prefer-const": "off", // 使用 let 关键字声明但在初始分配后从未重新分配的变量，要求使用 const

      // typeScript (https://typescript-eslint.io/rules)
      "@typescript-eslint/no-unused-vars": "warn", // 禁止定义未使用的变量
      "@typescript-eslint/no-explicit-any": "off", // 禁止使用 any 类型
      "@typescript-eslint/no-var-requires": "off", // 允许使用 require() 函数导入模块

      // vue (https://eslint.vuejs.org/rules)
      "vue/no-mutating-props": "error", // 不允许改变组件 prop
      "vue/attribute-hyphenation": "off", // 对模板中的自定义组件强制执行属性命名样式：my-prop="prop"
      "vue/no-v-html": "off", // 禁止使用 v-html
      "vue/multi-word-component-names": "off", // 要求组件名称始终为 "-" 链接的单词
      "vue/no-setup-props-destructure": "off" // 禁止解构 props 传递给 setup
    }
  },
  // 新配置中ignores直接写在defineConfig内
  {
    // Note: there should be no other properties in this object
    ignores: [
      "*.sh",
      "node_modules",
      "*.md",
      "*.woff",
      "*.ttf",
      ".vscode",
      ".idea",
      "dist",
      "/public",
      "/docs",
      ".husky",
      ".local",
      "/bin",
      "/src/mock/*"
    ]
  },
  eslintConfigPrettier
]);

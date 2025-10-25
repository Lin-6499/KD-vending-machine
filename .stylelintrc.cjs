// @see: https://stylelint.io

module.exports = {
  root: true,
  // 继承某些已有的规则
  extends: [
    "stylelint-config-standard", // 配置 stylelint 拓展插件
    "stylelint-config-html/vue", // 配置 vue 中 template 样式格式化
    "stylelint-config-standard-scss", // 配置 stylelint scss 插件
    "stylelint-config-recommended-vue/scss" // 配置 vue 中 scss 样式格式化
  ],
  overrides: [
    //  SCSS 文件解析器
    {
      files: ["**/*.scss"],
      customSyntax: "postcss-scss"
    },
    // 扫描 .vue/html 文件中的 <style> 标签内的样式
    {
      files: ["**/*.{vue,html}"],
      customSyntax: "postcss-html"
    }
  ],
  rules: {
    "scss/dollar-variable-pattern": /.*/, // 允许任意变量名格式
    "scss/no-global-function-names": null, // 允许原生 CSS 函数名
    "font-family-no-missing-generic-family-keyword": null, // 禁止在字体族名称列表中缺少通用字体族关键字
    "scss/at-import-partial-extension": null, // 解决不能使用 @import 引入 scss 文件
    "property-no-unknown": null, // 禁止未知的属性
    "selector-class-pattern": null, // 强制选择器类名的格式
    "no-descending-specificity": null, // 不允许较低特异性的选择器出现在覆盖较高特异性的选择器
    "value-keyword-case": null, // 解决在 scss 中使用 v-bind 大写单词报错
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global", "v-deep", "deep"]
      }
    ]
  },
  ignoreFiles: ["**/*.js", "**/*.jsx", "**/*.tsx", "**/*.ts"]
};

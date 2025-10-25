<template>
  <div class="snow-page">
    <div class="home-page">
      <!-- 数据大屏视图 -->
      <div class="datascreen-view">
        <DataScreen />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DataScreen from "@/views/home/data-screen.vue";
</script>

<style lang="scss" scoped>
.home-page {
  padding: $padding;
  background: $color-bg-1;

  .datascreen-view {
    // 数据大屏全屏显示
    margin: -20px;
  }
}
</style>

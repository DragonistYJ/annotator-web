<template>
  <el-row type="flex" align="middle" style="height: 100%">
    <el-col :span="2">
      <el-button icon="el-icon-d-arrow-left" size="small" @click="toggleSideBar"/>
    </el-col>
    <el-col :space="2">
      标注系统
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: "Header",
  methods: {
    toggleSideBar() {
      this.$store.dispatch('taggleView/toggleSideBar')
    },
  }
}
</script>

<style scoped>

</style>
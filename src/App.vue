<template>
  <el-container>
    <el-aside width="auto" style="height: 100%">
      <Sidebar/>
    </el-aside>

    <el-container>
      <el-header>
        <Header/>
      </el-header>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default {
  name: 'App',
  components: {Sidebar, Header},
  methods: {

  }
}
</script>

<style scoped>
.el-container {
  height: 100%;
}

.el-menu {
  height: 100%;
}
</style>

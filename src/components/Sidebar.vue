<template>
  <div style="height: 100%">
    <el-row>
      <el-col>
        <el-card shadow="always">
          标注系统
        </el-card>
      </el-col>
    </el-row>
    <el-menu :default-openeds="['1']" :collapse="isCollapse"
             class="el-menu-vertical-demo">
      <el-submenu index="1">
        <template slot="title">
          <i class="el-icon-message"></i>
          <span>NER标注</span>
        </template>
        <el-menu-item index="1-1" @click="toReportList">文档列表</el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
import {mapGetters} from "vuex"

export default {
  name: "Sidebar",
  computed: {
    ...mapGetters([
      "sidebar"
    ]),
    isCollapse() {
      return !this.sidebar.opened;
    }
  },
  methods: {
    toReportList() {
      this.$router.push("/report_list");
    },
  }
}
</script>

<style scoped>
.el-menu-vertical-demo {
  height: 90%;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  height: 80%;
  min-height: 90%;
}
</style>
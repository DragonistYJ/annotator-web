<template>
  <el-container>
    <el-main>
      <el-row style="margin-bottom: 20px; font-size: 2rem">
        <el-col>
          新建、修改报告
        </el-col>
      </el-row>

      <el-form ref="form" :model="report" label-width="100px">
        <el-form-item label="选择文件" v-if="report.id <= 0">
          <el-upload
              class="upload-demo"
              ref="upload"
              :on-change="handleChange"
              action="#"
              :limit="1"
              :auto-upload="false">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="报告UUID" required>
          <el-input v-model="report.uuid"></el-input>
        </el-form-item>
        <el-form-item label="报告标题" required>
          <el-input v-model="report.title"></el-input>
        </el-form-item>
        <el-form-item label="报告内容" v-if="report.id <= 0" required>
          <el-input type="textarea" v-model="report.content" :rows="12"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-if="report.id <= 0" @click="saveReport">上传</el-button>
          <el-button type="primary" v-else @click="updateReport">修改</el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: "ReportInfo",
  data() {
    return {
      report: {
        id: '',
        uuid: '',
        title: '',
        status: '',
        create_time: '',
        content: ""
      }
    }
  },
  mounted() {
    this["report"]["id"] = this.$route.query["report_id"];
    console.log(this["report"]["id"])
    if (this["report"]["id"] > 0) {
      this.$axios.get("/main-backend/report/get/" + this["report"]["id"])
          .then(response => {
            console.log(response);
            if (response["data"]["code"] === 200) {
              this.report = response["data"]["result"];
            }
          });
    }
  },
  methods: {
    handleChange(file, fileList) {
      console.log(fileList);

      let reader = new FileReader()
      reader.readAsText(file.raw)

      reader.onload = () => {
        this["report"]["content"] = reader.result;
      }
    },

    saveReport() {
      if (this.report["uuid"] === "" || this.report["title"] === "" || this.report["content"] === "") {
        return;
      }

      this.loading = this.$loading({
        lock: true,
        text: '文件上传中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.8)'
      });

      let data = new FormData();
      data.append('uuid', this.report["uuid"]);
      data.append('title', this.report["title"]);
      data.append('content', this.report["content"]);

      this.$axios.post("/main-backend/report/save", data)
          .then(response => {
            this.report = response["data"]["result"];
            this.toAnnotation(this.report["id"]);
          })
          .finally(() => {
            this.loading.close();
          })
    },

    toAnnotation(report_id) {
      this.$router.push({path: "/annotation", query: {"report_id": report_id}});
    },

    updateReport() {
      let data = JSON.stringify(this.report);

      this.$axios.post("/main-backend/report/update", data, {headers: {'Content-Type': 'application/json'}})
          .then(response => {
            this.report = response["data"]["result"];
            this.toReportList();
          });
    },

    toReportList() {
      this.$router.push({path: "/report_list"});
    }
  }
}
</script>

<style scoped>

</style>
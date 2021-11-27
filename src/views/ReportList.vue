<template>
  <el-container>
    <el-main>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="search">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>

        <el-col :span="4" :push="1">
          <el-button @click="openDocumentDialogAdd()">上传报告</el-button>
        </el-col>
      </el-row>

      <!--    APT报告列表    -->
      <el-table :data="documents" style="width: 100%">
        <el-table-column label="UUID" width="320">
          <template slot-scope="scope">
            <span>{{ scope.row.uuid }}</span>
          </template>
        </el-table-column>
        <el-table-column label="标题">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.create_time }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template slot-scope="scope">
            <el-tag
              size="medium"
              :type="scope.row.status === 'uncompleted' ? 'danger' : 'primary'"
            >
              {{ scope.row.status === "uncompleted" ? "未完成" : "已完成" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="openDocumentDialogUpdate(scope.row.document_id)"
            >
              修改
            </el-button>
            <el-button size="mini" @click="toAnnotation(scope.row.document_id)">
              标注
            </el-button>
            <el-button
              size="mini"
              @click="openDocumentDialogUpdate(scope.row.document_id)"
            >
              导出
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row>
        <el-pagination
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="documents.length"
        >
        </el-pagination>
      </el-row>
    </el-main>

    <el-dialog
      title="报告"
      :visible.sync="documentDialogVisible"
      :fullscreen="true"
    >
      <el-form ref="form" label-width="100px">
        <el-form-item
          label="选择文件"
          v-model="current_document"
          v-if="!current_document['existed']"
        >
          <el-upload
            class="upload-demo"
            ref="upload"
            action="#"
            :limit="1"
            :auto-upload="false"
          >
            <el-button slot="trigger" size="small" type="primary">
              选取文件
            </el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="文档UUID" required>
          <el-input v-model="current_document['uuid']" />
        </el-form-item>
        <el-form-item label="文档标题" required>
          <el-input v-model="current_document['name']" />
        </el-form-item>
        <el-form-item
          label="文档内容"
          v-if="!current_document['existed']"
          required
        >
          <el-input
            type="textarea"
            :rows="12"
            v-model="current_document['context']"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDocumentDialog()">取 消</el-button>
        <el-button
          type="primary"
          @click="updateDocument()"
          v-if="current_document['existed']"
        >
          修改
        </el-button>
        <el-button type="primary" @click="addDocument()" v-else>
          上传
        </el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
export default {
  name: "ReportList",
  data() {
    return {
      documentDialogVisible: false,
      search: "",
      documents: [],
      current_document: {
        document_id: "",
        uuid: "",
        name: "",
        status: "",
        context: "",
        existed: false,
      },
      pageSize: 10,
      currentPage: 1,
    };
  },
  mounted() {
    this.queryDocumments();
  },
  methods: {
    queryDocumments() {
      const loading = this.$loading({
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.8)",
      });

      this.$axios
        .get(
          "/annotator/document/query?page=" +
            (this.currentPage - 1) +
            "&size=" +
            this.pageSize
        )
        .then((response) => {
          this.documents = response["data"];
        })
        .finally(() => {
          loading.close();
        });
    },

    openDocumentDialogUpdate(document_id) {
      this.documentDialogVisible = true;
      this.$axios
        .get("/annotator/document/query?document_id=" + document_id)
        .then((response) => {
          this.current_document = response["data"][0];
          this.current_document["existed"] = true;
        });
    },

    updateDocument() {
      let data = JSON.stringify(this.current_document);

      let config = {
        method: "post",
        url: "/annotator/document/update",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      this.$axios(config)
        .then((response) => {
          if (response["data"]["status"] === "ok") {
            this.$message({
              message: "修改成功",
              type: "success",
            });
            this.closeDocumentDialog();
            this.queryDocumments();
          }
        })
        .catch(() => {
          this.$message({
            message: "修改失败",
            type: "error",
          });
        });
    },

    openDocumentDialogAdd() {
      this.documentDialogVisible = true;
      this.current_document["existed"] = false;
    },

    addDocument() {
      if (
        this.current_document["uuid"] === "" ||
        this.current_document["name"] == "" ||
        this.current_document["context"] == ""
      ) {
        return;
      }

      let data = JSON.stringify(this.current_document);
      let config = {
        method: "post",
        url: "/annotator/document/add",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      this.$axios(config)
        .then((response) => {
          if (response["data"]["status"] === "ok") {
            this.$message({
              message: "添加成功",
              type: "success",
            });
            this.closeDocumentDialog();
            this.queryDocumments();
          }
        })
        .catch((error) => {
          this.$message({
            message: "添加失败",
            type: "error",
          });
        });
    },

    closeDocumentDialog() {
      this.current_document = {
        document_id: "",
        uuid: "",
        name: "",
        status: "",
        context: "",
        existed: false,
      };
      this.documentDialogVisible = false;
    },

    onSizeChange(val) {
      this.pageSize = val;
      this.queryDocumments();
    },

    onCurrentChange(val) {
      this.currentPage = val;
      this.queryDocumments();
    },

    toAnnotation(document_id) {
      this.$router.push({path: "/annotation", query: {"document_id": document_id}});
    }
  },
};
</script>

<style scoped>
</style>
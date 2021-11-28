<template>
  <el-container>
    <el-header>
      <el-row
        type="flex"
        align="middle"
      >
        <el-col :span="15">
          {{ document.name }}
        </el-col>
        <el-col :span="3">
          <el-select
            v-model="document['status']"
            placeholder="请选择"
            @change="statusChange"
          >
            <el-option
              v-for="item in status"
              :key="item.en"
              :label="item.zh"
              :value="item.en"
            >
            </el-option>
          </el-select>
        </el-col>
        <el-col
          :span="2"
          :push="1"
        >
          <el-button @click="addSentenceDialogVisible = true">添加句子</el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <el-row
        v-for="sentence in sentences"
        :key="sentence['sentencce_id']"
        style="margin-bottom: 20px"
        type="flex"
        align="middle"
      >
        <el-col :span="1">
          {{ sentence["sequence"] }}
        </el-col>

        <!--    单词操作    -->
        <el-col :span="20">
          <el-popover
            :ref="'popover-' + sentence['sentencce_id'] + '-' + token['word_id']"
            placement="top"
            v-for="token in sentence['context']"
            :key="token['word_id']"
          >
            <el-row
              type="flex"
              align="middle"
              :gutter="10"
            >
              <!--    单词修改    -->
              <el-col :span="5">
                <el-input
                  placeholder="请输入内容"
                  v-model="token['word']"
                >
                  <el-button
                    slot="append"
                    size="mini"
                    @click="updateToken(sentence['sentence_id'], token)"
                  >
                    修改
                  </el-button>
                </el-input>
              </el-col>

              <!--    选择标签    -->
              <el-col :span="3">
                <el-select
                  v-model="token['label_id']"
                  placeholder="请选择"
                  @change="updateToken(sentence['sentence_id'], token)"
                >
                  <el-option
                    v-for="item in labelOptions"
                    :key="item.label_id"
                    :label="item.name"
                    :value="item.label_id"
                  >
                  </el-option>
                </el-select>
              </el-col>

              <!--    前后插入新词    -->
              <el-col :span="8">
                <el-input
                  placeholder="请输入内容"
                  v-model="token['newWord']"
                >
                  <el-button
                    slot="prepend"
                    size="mini"
                    @click="
                      addWord(
                        sentence['sentence_id'],
                        token['newWord'],
                        token['word_id']
                      )
                    "
                  >
                    插入前
                  </el-button>
                  <el-button
                    slot="append"
                    size="mini"
                    @click="
                      addWord(
                        sentence['sentence_id'],
                        token['newWord'],
                        token['word_id'] + 1
                      )
                    "
                  >
                    插入后
                  </el-button>
                </el-input>
              </el-col>

              <el-col :span="4">
                <el-button-group>
                  <el-button
                    size="small"
                    v-if="token['word_id'] !== 0"
                    @click="splitSentence(sentence['sentence_id'], token['word_id'])"
                  >
                    前分句
                  </el-button>
                  <el-button
                    size="small"
                    v-if="token['word_id'] !== sentence['context'].length - 1"
                    @click="splitSentence(sentence['sentence_id'],token['word_id'] + 1)"
                  >
                    后分句
                  </el-button>
                </el-button-group>
              </el-col>

              <!--    更多选项删除单词    -->
              <el-col :span="1">
                <el-button
                  :ref="'sentence-delete-' + sentence['sentencce_id']"
                  type="danger"
                  size="mini"
                  @click="deleteWord(sentence['sentence_id'], token['word_id'])"
                >
                  删除
                </el-button>
              </el-col>
            </el-row>

            <el-button
              style="
                margin-right: 10px;
                margin-top: 10px;
                color: black;
                font-size: 16px;
                padding: 8px 12px;
              "
              slot="reference"
            >
              {{ token["word"] }}
              <el-tag
                size="mini"
                v-if="token['label_id'] !== 0"
              >
                {{ id2label[token["label_id"]] }}
              </el-tag>
            </el-button>
          </el-popover>
        </el-col>

        <!--        右边按钮      -->
        <el-col :span="1">
          <el-popover placement="top">
            <el-button
              size="small"
              type="primary"
              @click="mergeSentence(sentence['belong_document_id'],sentence['sequence'] - 1,sentence['sequence'])"
              v-show="sentence['sequence'] !== 0"
            >
              上句
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="mergeSentence(sentence['belong_document_id'],sentence['sequence'],sentence['sequence'] + 1)"
              v-show="sentence['sequence'] !== total_sentences - 1"
            >
              下句
            </el-button>

            <el-button
              slot="reference"
              type="primary"
              size="small"
            >
              合并
            </el-button>
          </el-popover>
        </el-col>
        <el-col :span="1">
          <el-popconfirm
            confirm-button-text='确认'
            cancel-button-text='取消'
            @confirm="deleteSentence(sentence['sentence_id'])"
            icon="el-icon-info"
            icon-color="red"
            title="确认删除？"
          >
            <el-button
              type="danger"
              size="small"
              slot="reference"
            >
              删除
            </el-button>
          </el-popconfirm>
        </el-col>
      </el-row>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total_sentences"
        background
      />
    </el-main>

    <el-dialog
      title="添加句子"
      :visible.sync="addSentenceDialogVisible"
    >
      <el-form :model="newSentence">
        <el-form-item label="插入位置">
          <el-input-number
            v-model="newSentence.sequence"
            controls-position="right"
            :min="0"
            :max="total_sentences"
          />
        </el-form-item>
        <el-form-item label="句子内容（空格分句）">
          <el-input
            v-model="newSentence.context"
            type="textarea"
            autocomplete="off"
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="closeAddSentenceDialog()">取 消</el-button>
        <el-button
          type="primary"
          @click="addSentence()"
        >
          确 定
        </el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
export default {
  name: "Annotation",
  data() {
    return {
      document: {
        document_id: "",
        uuid: "",
        name: "",
        status: "",
        create_time: "",
        context: "",
      },
      sentences: [],
      total_sentences: 0,
      id2label: {},
      labelOptions: [],
      status: [
        { zh: "未完成", en: "uncompleted" },
        { zh: "完成", en: "completed" },
      ],
      currentPage: 1,
      pageSize: 5,
      addSentenceDialogVisible: false,
      newSentence: {
        context: "",
        sequence: 0,
      },
    };
  },
  mounted() {
    this.loading = this.$loading({
      lock: true,
      text: "加载中",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.8)",
    });

    this["document"]["document_id"] = this.$route.query["document_id"];

    this.getDocument();

    this.$axios.get("/annotator/label/all").then((response) => {
      this.labelOptions = [];
      let labels = response["data"];
      for (let i = 0; i < labels.length; i++) {
        this.id2label[labels[i]["label_id"]] = labels[i]["name"];
        this.labelOptions.push(labels[i]);
      }
    });

    this.countSentences();
    this.getSentences();
  },
  methods: {
    getDocument() {
      this.$axios
        .get(
          "/annotator/document/query?document_id=" +
            this["document"]["document_id"]
        )
        .then((response) => {
          this.document = response["data"][0];
        });
    },

    countSentences() {
      let config = {
        method: "get",
        url:
          "/annotator/sentence/count?belong_document_id=" +
          this.document.document_id,
      };

      this.$axios(config)
        .then((response) => {
          this.total_sentences = response.data["count"];
        })
        .catch((error) => {
          console.log(error);
        });
    },

    getSentences() {
      this.$axios
        .get(
          "/annotator/sentence/query?belong_document_id=" +
            this["document"]["document_id"] +
            "&page=" +
            (this.currentPage - 1) +
            "&size=" +
            this.pageSize
        )
        .then((response) => {
          this.sentences = [];
          let sentences = response["data"];
          sentences.forEach((item) => {
            this.sentences.push(item);
          });
        })
        .finally(() => {
          this.loading.close();
        });
    },

    updateToken(sentenceId, token) {
      let data = JSON.stringify({
        sentence_id: sentenceId,
        context: [token],
      });

      this.$axios
        .post("/annotator/sentence/update", data, {
          headers: { "Content-Type": "application/json" },
        })
        .then((response) => {
          this.$message({
            message: "修改成功",
            type: "success",
          });
        });
    },

    addWord(sentenceId, word, wordId) {
      let data = JSON.stringify({
        sentence_id: sentenceId,
        word_id: wordId,
        word: word,
      });

      this.$axios
        .post("/annotator/sentence/token/add", data, {
          headers: { "Content-Type": "application/json" },
        })
        .then(() => {
          this.getSentences();
        });
    },

    deleteWord(sentenceId, wordId) {
      let config = {
        method: "post",
        url:
          "/annotator/sentence/token/delete?sentence_id=" +
          sentenceId +
          "&word_id=" +
          wordId,
        headers: {
          "Content-Type": "application/json",
        },
      };
      this.$axios(config).then(() => {
        this.getSentences();
      });
    },

    mergeSentence(belong_document_id, sequence1, sequence2) {
      let config = {
        method: "post",
        url:
          "/annotator/sentence/merge?belong_document_id=" +
          belong_document_id +
          "&sequence1=" +
          sequence1 +
          "&sequence2=" +
          sequence2,
      };

      this.$axios(config)
        .then((response) => {
          this.$message({
            message: "合并句子成功",
            type: "success",
          });
        })
        .catch(function (error) {
          this.$message({
            message: "合并句子失败",
            type: "error",
          });
        })
        .finally(() => {
          this.countSentences();
          this.getSentences();
        });
    },

    splitSentence(sentence_id, word_id) {
      let config = {
        method: "post",
        url:
          "/annotator/sentence/split?sentence_id=" +
          sentence_id +
          "&word_id=" +
          word_id,
      };

      this.$axios(config)
        .then((response) => {
          this.$message({
            message: "拆分句子成功",
            type: "success",
          });
        })
        .catch((error) => {
          this.$message({
            message: "拆分句子失败",
            type: "error",
          });
        })
        .finally(() => {
          this.countSentences();
          this.getSentences();
        });
    },

    deleteSentence(sentence_id) {
      let config = {
        method: "post",
        url: "/annotator/sentence/delete?sentence_id=" + sentence_id,
      };

      this.$axios(config)
        .then((response) => {
          this.$message({
            message: "删除句子成功",
            type: "success",
          });
        })
        .catch((error) => {
          this.$message({
            message: "删除句子失败",
            type: "error",
          });
        })
        .finally(() => {
          this.countSentences();
          this.getSentences();
        });
    },

    statusChange() {
      let data = JSON.stringify(this.document);
      this.$axios
        .post("/annotator/document/update", data, {
          headers: { "Content-Type": "application/json" },
        })
        .then((response) => {
          this.getDocument();
          this.$message({
            message: "状态修改成功",
            type: "success",
          });
        });
    },

    handleSizeChange(val) {
      this.pageSize = val;
      this.getSentences();
    },

    handleCurrentChange(val) {
      this.currentPage = val;
      this.getSentences();
    },

    closeAddSentenceDialog() {
      this.addSentenceDialogVisible = false;
      this.newSentence = { context: "", sequence: 0 };
    },

    addSentence() {
      let data = JSON.stringify({
        context: this.newSentence.context,
        sequence: this.newSentence.sequence,
        belong_document_id: this.document.document_id,
      });

      let config = {
        method: "post",
        url: "/annotator/sentence/add",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      this.$axios(config)
        .then((response) => {
          this.$message({
            message: "添加句子成功",
            type: "success",
          });
        })
        .catch((error) => {
          this.$message({
            message: "添加句子失败",
            type: "error",
          });
        })
        .finally(() => {
          this.countSentences();
          this.getSentences();
          this.closeAddSentenceDialog();
        });
    },
  },
};
</script>

<style scoped>
</style>
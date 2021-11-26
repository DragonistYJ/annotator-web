<template>
  <el-container>
    <el-header>
      {{ document.name }}

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
              <el-col :span="4">
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
              <el-col :span="4">
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
                    @click="insertWord(sentence['sentence_id'], token['newWord'], token['word_id'])"
                  >
                    插入前
                  </el-button>
                  <el-button
                    slot="append"
                    size="mini"
                    @click="insertWord( sentence['sentence_id'], token['newWord'], token['word_id'] + 1)"
                  >
                    插入后
                  </el-button>
                </el-input>
              </el-col>

              <el-col :span="4">
                <el-button-group>
                  <el-button
                    size="small"
                    v-if="token['id'] !== 0"
                    @click="splitSentence(sentence['id'], token['id'])"
                  >
                    前分句
                  </el-button>
                  <el-button
                    size="small"
                    v-if="token['id'] !== token.length - 1"
                    @click="splitSentence(sentence['id'], token['id'] + 1)"
                  >
                    后分句
                  </el-button>
                </el-button-group>
              </el-col>

              <!--    更多选项删除单词    -->
              <el-col :span="6">
                <el-button
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
        <el-col :span="3">
          <el-popover placement="top">
            <el-button
              size="small"
              type="primary"
              @click="
                mergeSentence(
                  sentence['reportId'],
                  sentence['sequence'] - 1,
                  sentence['sequence']
                )
              "
              v-show="sentence['sequence'] !== 0"
            >
              上句
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="
                mergeSentence(
                  sentence['reportId'],
                  sentence['sequence'],
                  sentence['sequence'] + 1
                )
              "
              v-show="sentence['sequence'] !== sentences.length-1"
            >
              下句
            </el-button>

            <el-button
              slot="reference"
              type="primary"
            >合并</el-button>
          </el-popover>
        </el-col>
      </el-row>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="sentences.length"
        background
      />
    </el-main>
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
      id2label: {},
      labelOptions: [],
      status: [
        { zh: "未完成", en: "uncompleted" },
        { zh: "完成", en: "completed" },
      ],
      currentPage: 1,
      pageSize: 10,
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
        .then((response) => {});
    },

    insertWord(sentenceId, word, wordId) {
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

    mergeSentence(sentenceReportId, sentenceSequence1, sentenceSequence2) {
      let data = new FormData();
      data.append("reportId", sentenceReportId);
      data.append("sentenceSequence1", sentenceSequence1);
      data.append("sentenceSequence2", sentenceSequence2);

      this.$axios
        .post("/main-backend/sentence/merge", data)
        .then((response) => {
          console.log(response);
          this.getSentences();
        });
    },

    splitSentence(id, index) {
      console.log(id, index);
      let data = new FormData();
      data.append("id", id);
      data.append("index", index);

      this.$axios
        .post("/main-backend/sentence/split", data)
        .then((response) => {
          console.log(response);
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
  },
};
</script>

<style scoped>
</style>
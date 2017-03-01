<template>
<div id="app">
  <div class="header">
    <h1>Vue Template Validator</h1>
    <small>Built with <a href="https://github.com/vuejs/vue-cli" target="_blank">vue-cli</a> | Checkout
      <a href="https://github.com/znck/validate-vue-templates" target="_blank">source code</a></small>
  </div>

  <div class="body">
    <EditorWindow class="window" title="input">
      <textarea style="height: auto" ref="input" class="input" title="editor"> </textarea>
    </EditorWindow>

    <EditorWindow class="window" title="output">
      <div class="output">
        <div class="warnings" v-for="warning in warnings" v-html="warning">
        </div>

        <div class="success" v-if="warnings.length === 0">
          {{ outputTitle || 'No errors!' }}
        </div>
      </div>
    </EditorWindow>
  </div>
</div>
</template>

<script lang="babel">
import { EditorWindow } from 'vue-windows'
import CodeMirror from 'codemirror'
import debounce from 'lodash.debounce'
import fetch from 'axios'
import 'codemirror/mode/vue/vue'

const api = process.env.NODE_ENV === 'production' ?
    'https://validate-vue-templates-wmvrbryctg.now.sh/validate' :
    'http://localhost:3000/validate'

export default {
  name: 'VueTemplateValidator',

  data: () => ({
    outputTitle: null,
    warnings: []
  }),

  methods: {
    handleChange: debounce(function (e) {
      this.validate(e.getValue())
    }, 100),

    async validate (code) {
      try {
        this.outputTitle = 'Loading...'
        this.warnings = []
        const response = await fetch.post(api, { code })
        const { warnings, error } = response.data

        this.outputTitle = error
        this.warnings = warnings
        console.log(warnings)
      } catch (e) {
        this.outputTitle = e.toString()
      }
    },

    init () {
      this.editor = CodeMirror.fromTextArea(this.$refs.input, {
        mode: 'vue',
        tabSize: 2,
        indentWithTabs: false,
        viewportMargin: 0,
        extraKeys: {
          Tab: cm => {
            cm.replaceSelection(' '.repeat(cm.getOption('tabSize')))
          }
        }
      })
      this.editor.on('change', this.handleChange)
      setTimeout(() => {
        this.editor.refresh()
        this.editor.focus()
      }, 200)
    }
  },

  mounted () {
    this.$nextTick(() => this.init())
  },

  components: { EditorWindow }
}
</script>


<style lang="scss">
@import '~vue-windows/dist/vue-windows.css';
@import '~codemirror/lib/codemirror.css';

html, body, #app {
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding: 0;
  margin: 0;
  font-family: Helvetica, sans-serif;
}

#app {
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  width: 100%;
  background: #4fc08d;
  color: white;

  padding: .5rem 1rem;

  h1 {
    margin: 0 0 .5rem 0;
  }
  a {
    color: inherit;
  }
}

.body {
  flex: 1;
  display: flex;
  flex-direction: row;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 3rem 1rem;

  > *:first-child {
    margin-right: 2rem;
  }

  > * {
    flex: 1 1 50%;
    height: 100%;
  }
}

.input {
  height: 100%;
}

.output {
  overflow: auto;
}

.warnings {
  white-space: pre-wrap;
  font-family: monospace;
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  * {
    display: inline;
  }
}

.CodeMirror {
  height: 100%;
  margin: -10px;
}
</style>

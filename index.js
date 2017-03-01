const validator = require('vue-template-validator')
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const Convert = require('ansi-to-html');
const convert = new Convert();

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.options('/validate', cors())

app.post('/validate', cors(), (req, res) => {

  try {
    const { code } = req.body
    const warnings = validator(code)
    res.send({
      warnings: warnings.map(warning => convert.toHtml(warning.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;")))
    })
  } catch (err) {
    res.status(500)
    res.send({ error: err.message })
  }
})

app.get('/', (req, res) => {
  res.end(`
  POST /validate
  Data:
  - code: the source code you wanna validate
  Repo: https://github.com/znck/validate-vue-templates
`)
})

app.listen(3000)
console.log(`Open http://localhost:3000`)



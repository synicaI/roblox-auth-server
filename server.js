const express = require("express")
const app = express()

app.use(express.json())

const keys = {
  "test": {
    expires: Math.floor(Date.now() / 1000) + 86400 * 30,
    hwid: null
  }
}

app.post("/verify", (req, res) => {
  const { key, hwid } = req.body

  if (!key || !hwid)
    return res.json({ valid: false })

  const entry = keys[key]
  if (!entry)
    return res.json({ valid: false })

  if (Math.floor(Date.now() / 1000) > entry.expires)
    return res.json({ valid: false })

  if (entry.hwid && entry.hwid !== hwid)
    return res.json({ valid: false })

  if (!entry.hwid)
    entry.hwid = hwid

  res.json({ valid: true })
})

app.get("/", (_, res) => res.send("Auth server running"))

app.listen(process.env.PORT || 3000)

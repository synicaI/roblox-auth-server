import express from "express"
import fs from "fs"

const app = express()
app.use(express.json())

const loadDB = () =>
  JSON.parse(fs.readFileSync("./keys.json", "utf8"))

const saveDB = (db) =>
  fs.writeFileSync("./keys.json", JSON.stringify(db, null, 2))

app.post("/verify", (req, res) => {
    const { key, hwid } = req.body
    const db = loadDB()

    if (!db[key]) {
        return res.json({ success: false, reason: "Invalid key" })
    }

    const keyData = db[key]

    // ⏰ expiration check
    const today = new Date()
    const expires = new Date(keyData.expires)

    if (today > expires) {
        return res.json({ success: false, reason: "Key expired" })
    }

    // 🔒 HWID lock
    if (!keyData.hwid) {
        keyData.hwid = hwid
        saveDB(db)
    }

    if (keyData.hwid !== hwid) {
        return res.json({ success: false, reason: "HWID mismatch" })
    }

    res.json({
        success: true,
        expires: keyData.expires
    })
})

app.listen(process.env.PORT || 3000, () =>
  console.log("Key system online")
)

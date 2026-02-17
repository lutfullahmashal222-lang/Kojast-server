const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const DB = "shops.json";
const USERS = "users.json";

const ADMIN_PASSWORD = "1234";

// آپلود عکس
const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".jpg");
  }
});
const upload = multer({ storage });

// دیتابیس
function read(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file));
}

function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ثبت کاربر
app.post("/api/register", (req, res) => {
  let users = read(USERS);
  users.push(req.body);
  write(USERS, users);
  res.json({ success: true });
});

// ورود
app.post("/api/login", (req, res) => {
  let users = read(USERS);
  let user = users.find(
    u => u.phone == req.body.phone && u.password == req.body.password
  );
  if (!user) return res.status(401).json({ error: "اشتباه" });
  res.json({ success: true });
});

// ثبت دکان
app.post("/api/shops", upload.single("image"), (req, res) => {
  let shops = read(DB);

  const shop = {
    id: Date.now(),
    name: req.body.name,
    city: req.body.city,
    category: req.body.category,
    phone: req.body.phone,
    whatsapp: req.body.whatsapp,
    lat: req.body.lat,
    lng: req.body.lng,
    image: req.file ? "/uploads/" + req.file.filename : ""
  };

  shops.push(shop);
  write(DB, shops);

  res.json({ success: true });
});

// گرفتن دکان‌ها
app.get("/api/shops", (req, res) => {
  res.json(read(DB));
});

// حذف
app.delete("/api/shops/:id", (req, res) => {
  if (req.headers.password !== ADMIN_PASSWORD)
    return res.status(401).json({ error: "رمز اشتباه" });

  let shops = read(DB);
  shops = shops.filter(s => s.id != req.params.id);
  write(DB, shops);

  res.json({ success: true });
});

// ویرایش
app.put("/api/shops/:id", (req, res) => {
  let shops = read(DB);

  shops = shops.map(s =>
    s.id == req.params.id ? { ...s, ...req.body } : s
  );

  write(DB, shops);

  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));

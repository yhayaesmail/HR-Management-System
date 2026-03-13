import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
const PORT = process.env.PORT || 4500;

app.get("/", (req, res) => {
  res.send({ message: "Hallo Server is Functional" });
});

app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
});

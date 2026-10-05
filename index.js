const express = require("express");
const dns = require("dns");
const dotenv = require("dotenv");

dotenv.config();
const connectDB = require("./database/connectDB");
const app = express();

app.use(express.json());

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const UserRouter = require("./routes/user.routes");


app.use("/api/v1", UserRouter);

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) =>{
  res.send("welcome to the api");
})

if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log("Server started on port", PORT);
      });
    })
    .catch((err) => {
      console.error("Cannot connect to DB:", err.message);
      process.exitCode = 1;
    });
}

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
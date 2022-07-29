import express from "express";
import morgan from "morgan";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.get("/hello/:name", (req, res) => {
  const { name } = req.params;

  if (name) {
    res.json({ msg: `Hello, ${name}!` });
  } else {
    res.json({ msg: "Hello, World!" });
  }
});

const httpPort = process.env.HTTP_PORT || 3000;

app.listen(httpPort, () =>
  console.log(`Started listening on port ${httpPort}`)
);

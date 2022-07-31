import express from "express";
import morgan from "morgan";
import webhooks from "./routes/webhooks";
import workspaces from "./routes/workspaces";

const app = express();

app.use(morgan("dev"));

app.use("/webhooks/stripe", express.raw({ type: "*/*" }));
app.use(express.json());

app.use("/webhooks", webhooks);
app.use("/workspaces", workspaces);

const httpPort = process.env.HTTP_PORT || 3000;

app.listen(httpPort, () =>
  console.log(`Started listening on port ${httpPort}`)
);

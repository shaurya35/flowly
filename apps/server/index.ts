import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
    res.json({message: "Health Check!"})
});

import auth from "./routes/v1/auth";
import profile from "./routes/v1/profile";
import node from "./routes/v1/node";
import workflow from "./routes/v1/workflow";
import workflowExecution from "./routes/v1/workflowExecutions";
import nodeExecution from "./routes/v1/nodeExecutions";

app.use("/api/v1/auth", auth);
app.use("/api/v1/profile", profile);
app.use("/api/v1/nodes", node);
app.use("/api/v1/workflows", workflow);
app.use("/api/v1/workflow-executions", workflowExecution);
app.use("/api/v1/node-executions", nodeExecution);

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})

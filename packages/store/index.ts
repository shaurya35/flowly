import mongoose from "mongoose";
import {
  userSchema,
  nodeSchema,
  workflowSchema,
  workflowExecutionSchema,
} from "./schema";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/flowly";

let isConnected = false;

export async function connectToDatabase() {
  if (!isConnected) {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("Connected to MongoDB");
  }
}

export async function disconnectFromDatabase() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("Disconnected from MongoDB");
  }
}

export const User = mongoose.model("User", userSchema);
export const Node = mongoose.model("Node", nodeSchema);
export const Workflow = mongoose.model("Workflow", workflowSchema);
export const WorkflowExecution = mongoose.model("WorkflowExecution", workflowExecutionSchema);

export { userSchema, nodeSchema, workflowSchema, workflowExecutionSchema };

export function getConnectionStatus() {
  return isConnected;
}

export { mongoose };

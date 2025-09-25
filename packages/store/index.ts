import mongoose from "mongoose";
import {
  userSchema,
  nodeSchema,
  workflowSchema,
  workflowExecutionSchema,
} from "./schema";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/flowly";
  
const MONGODB_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  bufferCommands: false,
};

let isConnected = false;

export const connectToDatabase = async (): Promise<void> => {
  if (isConnected) {
    console.log("Already connected to MongoDB");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, MONGODB_OPTIONS);
    isConnected = true;
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (!isConnected) {
    console.log("Not connected to MongoDB");
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ MongoDB disconnection error:", error);
    throw error;
  }
};

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
  isConnected = true;
});

mongoose.connection.on("error", (error) => {
  console.error("Mongoose connection error:", error);
  isConnected = false;
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB");
  isConnected = false;
});

process.on("SIGINT", async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

export const User = mongoose.model("User", userSchema);
export const Node = mongoose.model("Node", nodeSchema);
export const Workflow = mongoose.model("Workflow", workflowSchema);
export const WorkflowExecution = mongoose.model(
  "WorkflowExecution",
  workflowExecutionSchema
);

export { userSchema, nodeSchema, workflowSchema, workflowExecutionSchema };

export const getConnectionStatus = (): boolean => isConnected;

export { mongoose };

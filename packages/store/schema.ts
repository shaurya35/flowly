import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    _id: String,
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    otp: String,
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const nodeSchema = new Schema(
  {
    _id: String,
    label: String,
    name: String,
    description: String,
    type: {
      type: String,
      enum: [
        "email",        // Send emails via Resend
        "discord",      // Send Discord messages via webhooks
        "gemini",       // Google Gemini AI integration
        "openai",       // OpenAI API integration
        "openrouter",   // OpenRouter API integration
        "trigger",      // Workflow trigger/start node
        "condition",    // Conditional logic node
        "delay",        // Wait/delay node
      ],
      required: true,
    },
    position: {
      x: Number,
      y: Number,
    },

    config: {
      email: {
        resend_token: String,    // API token for Resend service
        from_email: String,      // Sender email address
        to_email: String,        // Recipient email address
        subject: String,         // Email subject line
        template: String,        // Email body template
      },

      discord: {
        webhook_url: String,     // Discord webhook URL
        channel_id: String,      // Discord channel ID
        message_template: String, // Message template/format
      },

      ai: {
        api_key: String,         // API key for the AI service
        model: String,           // AI model to use (e.g., "gpt-4", "gemini-pro")
        temperature: Number,     // AI creativity/randomness (0-1)
        max_tokens: Number,      // Maximum response length
        prompt_template: String, // Prompt template for AI
      },

      custom: mongoose.Schema.Types.Mixed,
    },

    connections: {
      inputs: [String],  // Array of node IDs that connect TO this node
      outputs: [String], // Array of node IDs that this node connects TO
    },

    status: {
      type: String,
      enum: [
        "idle",       // Node is ready but not executing
        "running",    // Node is currently executing
        "completed",  // Node finished successfully
        "skipped"     // Node was skipped 
      ],
      default: "idle",
    },

    workflowId: { type: String, ref: "Workflow", required: true },

    userId: {
      type: String,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const workflowSchema = new Schema(
  {
    _id: String,
    name: String,
    description: String,

    status: {
      type: String,
      enum: [
        "draft",    // Workflow is being created/edited
        "active",   // Workflow is enabled and can be triggered
        "paused",   // Workflow is temporarily disabled
        "archived"  // Workflow is permanently disabled/archived
      ],
      default: "draft",
    },

    // Trigger configuration - defines how the workflow starts
    trigger: {
      // Type of trigger that starts this workflow
      type: {
        type: String,
        enum: [
          "manual",   // Manually triggered by user
          "webhook",  // Triggered by HTTP webhook
          "schedule", // Triggered by cron schedule
          "event"     // Triggered by system events
        ],
        default: "manual",
      },
      config: mongoose.Schema.Types.Mixed,
    },

    // Workflow execution settings
    settings: {
      retryCount: { type: Number, default: 3 },        // How many times to retry failed nodes
      timeout: { type: Number, default: 300000 },      // Max execution time (5 minutes)
      parallelExecution: { type: Boolean, default: false }, // Allow parallel node execution
    },

    userId: { type: String, ref: "User", required: true },

    stats: {
      totalRuns: { type: Number, default: 0 },         // Total number of workflow executions
      successfulRuns: { type: Number, default: 0 },    // Number of successful executions
      failedRuns: { type: Number, default: 0 },        // Number of failed executions
      lastRun: Date,                                   // Timestamp of last execution
    },
  },
  {
    timestamps: true,
  }
);

// Workflow Execution Schema - Tracks individual workflow runs/executions
const workflowExecutionSchema = new Schema(
  {
    _id: String,
    workflowId: { type: String, ref: "Workflow", required: true },
    status: {
      type: String,
      enum: [
        "running",    // Workflow is currently executing
        "completed",  // Workflow finished successfully
        "failed",     // Workflow failed with errors
        "cancelled"   // Workflow was manually cancelled
      ],
      required: true,
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    error: String,

    // Array of individual node executions within this workflow run
    nodeExecutions: [
      {
        // Reference to the specific node being executed
        nodeId: { type: String, ref: "Node", required: true },
        status: {
          type: String,
          enum: [
            "pending",   // Node is waiting to be executed
            "running",   // Node is currently executing
            "completed", // Node finished successfully
            "failed",    // Node failed with errors
            "skipped"    // Node was skipped (e.g., condition not met)
          ],
          required: true,
        },
        startedAt: Date,
        completedAt: Date,
        input: mongoose.Schema.Types.Mixed,
        output: mongoose.Schema.Types.Mixed,
        error: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export { userSchema, nodeSchema, workflowSchema, workflowExecutionSchema };

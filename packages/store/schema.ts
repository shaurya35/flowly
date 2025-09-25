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
    createdAt: Date,
    updatedAt: Date,
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
        "email",
        "discord",
        "gemini",
        "openai",
        "openrouter",
        "trigger",
        "condition",
        "delay",
      ],
      required: true,
    },
    position: {
      x: Number,
      y: Number,
    },

    config: {
      email: {
        resend_token: String,
        from_email: String,
        to_email: String,
        subject: String,
        template: String,
      },

      discord: {
        webhook_url: String,
        channel_id: String,
        message_template: String,
      },

      ai: {
        api_key: String,
        model: String,
        temperature: Number,
        max_tokens: Number,
        prompt_template: String,
      },

      custom: mongoose.Schema.Types.Mixed,
    },

    connections: {
      inputs: [String],
      outputs: [String],
    },

    status: {
      type: String,
      enum: ["idle", "running", "completed", "skipped"],
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
      enum: ["draft", "active", "paused", "archived"],
      default: "draft",
    },

    trigger: {
      type: {
        type: String,
        enum: ["manual", "webhook", "schedule", "event"],
        default: "manual",
      },
      config: mongoose.Schema.Types.Mixed,
    },

    settings: {
      retryCount: { type: Number, default: 3 },
      timeout: { type: Number, default: 300000 },
      parallelExecution: { type: Boolean, default: false },
    },

    userId: { type: String, ref: "User", required: true },

    stats: {
      totalRuns: { type: Number, default: 0 },
      successfulRuns: { type: Number, default: 0 },
      failedRuns: { type: Number, default: 0 },
      lastRun: Date,
    },
  },
  {
    timestamps: true,
  }
);

const workflowExecutionSchema = new Schema(
  {
    _id: String,
    workflowId: { type: String, ref: "Workflow", required: true },
    status: {
      type: String,
      enum: ["running", "completed", "failed", "cancelled"],
      required: true,
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    error: String,

    nodeExecutions: [
      {
        nodeId: { type: String, ref: "Node", required: true },
        status: {
          type: String,
          enum: ["pending", "running", "completed", "failed", "skipped"],
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

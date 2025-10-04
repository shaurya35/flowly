import express from "express";
import {
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
} from "../../controllers/v1/workflows";
import { isLoggedIn } from "../../middlewares/auth";

const router = express.Router();

router.get("/", isLoggedIn, getAllWorkflows);
router.get("/:id", isLoggedIn, getWorkflowById);
router.post("/", isLoggedIn, createWorkflow);
router.put("/:id", isLoggedIn, updateWorkflow);
router.delete("/:id", isLoggedIn, deleteWorkflow);
router.post("/:id/execute", isLoggedIn, executeWorkflow);

export default router;
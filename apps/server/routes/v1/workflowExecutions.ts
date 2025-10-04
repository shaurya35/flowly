import express from "express";
import {
  getAllWorkflowExecutions,
  getWorkflowExecutionById,
  createWorkflowExecution,
  updateWorkflowExecution,
  deleteWorkflowExecution,
} from "../../controllers/v1/workflowExecutions";
import { isLoggedIn } from "../../middlewares/auth";

const router = express.Router();

router.get("/", isLoggedIn, getAllWorkflowExecutions);
router.get("/:id", isLoggedIn, getWorkflowExecutionById);
router.post("/", isLoggedIn, createWorkflowExecution);
router.put("/:id", isLoggedIn, updateWorkflowExecution);
router.delete("/:id", isLoggedIn, deleteWorkflowExecution);

export default router;

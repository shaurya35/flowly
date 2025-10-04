import express from "express";
import {
  getAllNodeExecutions,
  getNodeExecutionById,
  createNodeExecution,
  updateNodeExecution,
  deleteNodeExecution,
} from "../../controllers/v1/nodeExecutions";
import { isLoggedIn } from "../../middlewares/auth";

const router = express.Router();

router.get("/", isLoggedIn, getAllNodeExecutions);
router.get("/:id", isLoggedIn, getNodeExecutionById);
router.post("/", isLoggedIn, createNodeExecution);
router.put("/:id", isLoggedIn, updateNodeExecution);
router.delete("/:id", isLoggedIn, deleteNodeExecution);

export default router;

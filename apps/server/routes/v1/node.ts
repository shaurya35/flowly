import express from "express";
import {
  getAllNodes,
  getNodeById,
  createNode,
  updateNode,
  deleteNode,
} from "../../controllers/v1/nodes";
import { isLoggedIn } from "../../middlewares/auth";

const router = express.Router();

router.get("/", isLoggedIn, getAllNodes);
router.get("/:id", isLoggedIn, getNodeById);
router.post("/", isLoggedIn, createNode);
router.put("/:id", isLoggedIn, updateNode);
router.delete("/:id", isLoggedIn, deleteNode);

export default router;

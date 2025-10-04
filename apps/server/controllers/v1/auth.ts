import { prisma } from "store";

import { generateToken, decodeToken } from "../../helpers/jwt";
import { hashPassword, comparePassword } from "../../helpers/bcrypt";
import type { Request, Response } from "express";

const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body as {
      email?: string;
      password?: string;
      name?: string;
    };
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "user already exists" });
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: passwordHash, name },
    });
    const token = generateToken(user);
    return res
      .status(201)
      .json({
        user: { id: user.id, email: user.email, name: user.name },
        token,
      });
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "invalid credentials" });
    }
    const token = generateToken(user);
    return res
      .status(200)
      .json({
        user: { id: user.id, email: user.email, name: user.name },
        token,
      });
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export { signup, signin };

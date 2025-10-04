import jwt from "jsonwebtoken";

const generateToken = (user: any) => {
  if (!process.env.JWT_SECRET) {
    console.log("No JWT_SECRET!");
    return;
  }
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "30d" }
  );
};

const decodeToken = (token: string) => {
  if (!process.env.JWT_SECRET) {
    console.log("No JWT_SECRET");
    return;
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  return decoded;
};

export { generateToken, decodeToken }

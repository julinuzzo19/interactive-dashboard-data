import { Request, Response } from "express";
import { connect } from "../../config/database";

export async function createUsers(req: Request, res: Response): Promise<Response> {
  const conn = await connect();
  try {
    return res.status(201).json({});
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ message: "Internal error" });
  } finally {
    conn.end();
  }
}

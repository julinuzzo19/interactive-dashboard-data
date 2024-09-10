import { connect } from "../../config/database";
import { generateUUID } from "../../utils/generateId";
import { Users } from "./users.inteface";

export const getUserHelper = async ({ userId }: { userId: Users["id"] }) => {
  const conn = await connect();
  try {
    // @ts-ignore
    const [resultUser]: Users[][] = await conn.query(
      `SELECT users.*
      FROM users
      WHERE users.id = ?`,
      [userId]
    );

    return resultUser;
  } catch (err) {
    // console.log({ errgetUserHelper: err });
    // @ts-ignore
    throw new Error(err.message);
  } finally {
    conn.end();
  }
};

export const createClientes = async (clientesBody: Users[]) => {
  const conn = await connect();
  try {
    await Promise.all(
      clientesBody.map((clienteBody) => {
        clienteBody.id = generateUUID();
        console.log({ clienteBody });
        return conn.query("INSERT INTO users SET ?", clienteBody);
      })
    );
  } catch (err) {
    console.log({ errcreateClientes: err });
    // @ts-ignore
    throw new Error(err.message);
  } finally {
    conn.end();
  }
};

export const updateUser = async (userId: Users["id"], userBody: Partial<Users>) => {
  const conn = await connect();
  try {
    // console.log({ userId, userBody });
    await conn.query("UPDATE users SET ? WHERE id = ?", [userBody, userId]);
  } catch (error) {
    console.log({ error });
    // @ts-ignore
    throw new Error(error.message);
  } finally {
    conn.end();
  }
};

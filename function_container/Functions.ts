import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import DbClient from "../config/db_config";
import {User_model, Subject_model} from "../models/models";
import { seq } from "../models/models";

var key = "";


function login(req: Request, res: Response): void {
  var user= {
    firstname: req.body.firstname,
    password: req.body.password,
    key: req.body.key,
  };

  
  const sql =
    "SELECT * FROM users WHERE firstname = $1 AND password = $2 AND secret_key =$3";

  const values = [user.firstname, user.password, user.key];

  DbClient.query(sql, values, (err, result) => {
    if (!err && result.rows.length !== 0) {
      const db_user = result.rows[0];

      key = result.rows[0].secret_key;

      try {
        jwt.sign({ user }, key, (err, token) => {
          if (err) {
            console.log(err.message);
          } else {
            console.log("DBUSER#####################: ", db_user);
            const token_insert =
              "INSERT INTO login (token,user_id) VALUES($1, $2)";
            const t_values = [token, db_user.id];

            DbClient.query(token_insert, t_values, (err, result) => {
              if (err) {
                res.send(err);
              }
              // else {
              //   console.log(result);
              //   res.send({message: "Token saved to database."})
              // }
            });

            res.json({
              token,
            });
          }
        });
      } catch (err) {
        console.log(err.message);
      }
    } else {
      res.send("user not validated");
      console.log(err.message);
      console.log(err);
    }
  });
}

interface AuthenticatedRequest extends Request {
  token?: string;
}
function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const bearerHeader = req.headers["authorization"];
  console.log(bearerHeader);
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];



    jwt.verify(token, key, (err, authData: any) => {

      if (err) {
        console.log(err);
        return res.status(401).json({ message: "Unauthorized" });
      } else {
        console.log(authData.user.firstname);
        const sqll = `SELECT * FROM users where firstname=$1`;
        const values = [authData.user.firstname];
        DbClient.query(sqll, values, (err, result) => {
          if (err) {
            res.status(401).json({ message: "not verified", error: err });
          } else {
            next();
          }
        });
      }
    });
  } else {
    res.send({
      result: "invalid token",
    });
  }
}

function getProfile(req: Request, res: Response): void {
  const user_id = res.locals.user.id;

  // console.log('Profile: ', res.locals.user);
  // res.end();
}

async function getSubject(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    const subjects = await Subject_model.findAll({
      limit: pageSize,
      offset,
      order: [['id', 'ASC']],
    });

    res.send(subjects);
  } catch (err) {
    console.log(err.message);
    res.send({ error: err });
  }
}

function getSubjectsById(req: Request, res: Response): void {
  const id = parseInt(req.params.id);
  DbClient.query(`SELECT * FROM subjects WHERE id=${id}`, (err, result) => {
    if (err) {
      console.log(err.message);
    } else {
      res.send(result.rows);
    }
  });
}

function createSubject(req: Request, res: Response): void {
  const name = req.body.name;
  const code = req.body.code;
  DbClient.query(
    `INSERT INTO subjects(name, code) VALUES($1, $2)`,
    [name, code],
    (err, result) => {
      if (err) {
        console.log(err.message);
      } else {
        res.send("successfully inserted");
      }
    }
  );
}

function updateSubject(req: Request, res: Response): void {
  const id = parseInt(req.params.id);
  const name = req.body.name;
  const code = req.body.code;
  DbClient.query(
    `UPDATE subjects SET name = $1, code = $2 WHERE id = $3`,
    [name, code, id],
    (err, result) => {
      if (err) {
        console.log(err.message);
      } else {
        res.send("successfully updated");
      }
    }
  );
}

function deleteSubject(req: Request, res: Response): void {
  const id = parseInt(req.params.id);
  DbClient.query(`DELETE FROM subjects WHERE id = $1`, [id], (err, result) => {
    if (err) {
      console.log(err.message);
    } else {
      res.send("successfully deleted");
    }
  });
}

export {
  getSubject,
  getSubjectsById,
  createSubject,
  updateSubject,
  deleteSubject,
  login,
  verifyToken,
  getProfile,
};
export { AuthenticatedRequest };


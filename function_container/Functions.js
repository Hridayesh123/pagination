"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.verifyToken = exports.login = exports.deleteSubject = exports.updateSubject = exports.createSubject = exports.getSubjectsById = exports.getSubject = void 0;
var jwt = require("jsonwebtoken");
var db_config_1 = require("../config/db_config");
var key = "";
function login(req, res) {
    var user = {
        firstname: req.body.firstname,
        password: req.body.password,
        key: req.body.key,
    };
    //const { firstname, password, key } = user;
    var sql = "SELECT * FROM users WHERE firstname = $1 AND password = $2 AND secret_key =$3";
    var values = [user.firstname, user.password, user.key];
    db_config_1.default.query(sql, values, function (err, result) {
        if (!err && result.rows.length !== 0) {
            var db_user_1 = result.rows[0];
            key = result.rows[0].secret_key;
            try {
                jwt.sign({ user: user }, key, function (err, token) {
                    if (err) {
                        console.log(err.message);
                    }
                    else {
                        console.log("DBUSER#####################: ", db_user_1);
                        var token_insert = "INSERT INTO login (token,user_id) VALUES($1, $2)";
                        var t_values = [token, db_user_1.id];
                        db_config_1.default.query(token_insert, t_values, function (err, result) {
                            if (err) {
                                res.send(err);
                            }
                            // else {
                            //   console.log(result);
                            //   res.send({message: "Token saved to database."})
                            // }
                        });
                        res.json({
                            token: token,
                        });
                    }
                });
            }
            catch (err) {
                console.log(err.message);
            }
        }
        else {
            res.send("user not validated");
            console.log(err.message);
        }
    });
}
exports.login = login;
function verifyToken(req, res, next) {
    var bearerHeader = req.headers["authorization"];
    console.log(bearerHeader);
    if (typeof bearerHeader !== "undefined") {
        var bearer = bearerHeader.split(" ");
        var token = bearer[1];
        // const sql ="SEELCT * FROM login WHERE token =$1";
        // const values = [token];
        // DbClient.query(sql, values, (err,result) =>{
        // })
        jwt.verify(token, key, function (err, authData) {
            //console.log('Token key ########: ', key);
            if (err) {
                console.log(err);
                return res.status(401).json({ message: "Unauthorized" });
            }
            else {
                console.log(authData.user.firstname);
                var sqll = "SELECT * FROM users where firstname=$1";
                var values = [authData.user.firstname];
                db_config_1.default.query(sqll, values, function (err, result) {
                    if (err) {
                        res.status(401).json({ message: "not verified", error: err });
                    }
                    else {
                        next();
                    }
                });
            }
        });
    }
    else {
        res.send({
            result: "invalid token",
        });
    }
}
exports.verifyToken = verifyToken;
function getProfile(req, res) {
    var user_id = res.locals.user.id;
    // console.log('Profile: ', res.locals.user);
    // res.end();
}
exports.getProfile = getProfile;
function getSubject(req, res) {
    console.log("getsubject res locals", res.locals);
    db_config_1.default.query("SELECT * FROM subjects", function (err, result) {
        if (err) {
            console.log(err.message);
            res.send({ error: err });
        }
        else {
            res.send(result.rows);
        }
    });
}
exports.getSubject = getSubject;
function getSubjectsById(req, res) {
    var id = parseInt(req.params.id);
    db_config_1.default.query("SELECT * FROM subjects WHERE id=".concat(id), function (err, result) {
        if (err) {
            console.log(err.message);
        }
        else {
            res.send(result.rows);
        }
    });
}
exports.getSubjectsById = getSubjectsById;
function createSubject(req, res) {
    var name = req.body.name;
    var code = req.body.code;
    db_config_1.default.query("INSERT INTO subjects(name, code) VALUES($1, $2)", [name, code], function (err, result) {
        if (err) {
            console.log(err.message);
        }
        else {
            res.send("successfully inserted");
        }
    });
}
exports.createSubject = createSubject;
function updateSubject(req, res) {
    var id = parseInt(req.params.id);
    var name = req.body.name;
    var code = req.body.code;
    db_config_1.default.query("UPDATE subjects SET name = $1, code = $2 WHERE id = $3", [name, code, id], function (err, result) {
        if (err) {
            console.log(err.message);
        }
        else {
            res.send("successfully updated");
        }
    });
}
exports.updateSubject = updateSubject;
function deleteSubject(req, res) {
    var id = parseInt(req.params.id);
    db_config_1.default.query("DELETE FROM subjects WHERE id = $1", [id], function (err, result) {
        if (err) {
            console.log(err.message);
        }
        else {
            res.send("successfully deleted");
        }
    });
}
exports.deleteSubject = deleteSubject;
///jjjj

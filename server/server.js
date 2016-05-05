/**
 * Created by s.kovalevskaya on 02.05.2016.
 */
"use strict";
var express = require("express");
var bodyParser = require("body-parser");
var application = express();
var pg = require("pg");

var port = 8080;

var router = express.Router();
var dbConnectionString = "postgres://user:1@localhost:5432/softengi";

router.get("/settings", function (request, response) {
    pg.connect(dbConnectionString, function (err, client, done) {
        if (err) {
            response.send(500);
            return console.error("error fetching client from pool", err);
        }
        client.query("SELECT * FROM application_settings WHERE key='test_settings'", function (err, result) {
            done();
            if (err) {
                response.send(500);
                return console.error("error running query", err);
            } else {
                response.json(result.rows[0].value);
            }
        });
    });
});

router.put("/settings", function (request, response) {
    pg.connect(dbConnectionString, function (err, client, done) {
        if (err) {
            response.send(500);
            return console.error("error fetching client from pool", err);
        }
        client.query("UPDATE application_settings SET value=$1 WHERE key='test_settings'", [request.body], function (err, result) {
            done();
            if (err) {
                response.send(500);
                return console.error("error running query", err);
            } else {
                response.json(request.body);
            }
        });
    });
});

router.post("/testing/authorize", function (request, response) {
    pg.connect(dbConnectionString, function (err, client, done) {
        if (err) {
            response.send(500);
            return console.error("error fetching client from pool", err);
        }
        client.query("SELECT * FROM students WHERE name=$1", [request.body.name], function (err, result) {
            done();
            if (err) {
                response.send(500);
                return console.error("error running query", err);
            } else {
                if (result.rows.length == 0) {
                    client.query("INSERT INTO students(name) values($1) RETURNING *", [request.body.name], function (err, result) {
                        done();
                        if (err) {
                            response.send(500);
                            return console.error("error running query", err);
                        } else {
                            response.json({id: result.rows[0].id, name: result.rows[0].name});
                        }
                    });
                } else {
                    response.json({id: result.rows[0].id, name: result.rows[0].name});
                }
            }

        });
    });
});

router.post("/testing/start_test", function (request, response) {
    pg.connect(dbConnectionString, function (err, client, done) {
        if (err) {
            response.send(500);
            return console.error("error fetching client from pool", err);
        }
        client.query("SELECT * FROM application_settings WHERE key='test_settings'", function (err, result) {
            done();
            if (err) {
                response.send(500);
                return console.error("error running query", err);
            } else {
                var settings = result.rows[0].value;
                client.query("INSERT INTO student_tests(student_id, date, addition, subtraction, multiplication, division, " +
                    "number_of_questions) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
                    [request.body.id, new Date(), settings.addition, settings.subtraction, settings.multiplication, settings.division,
                        settings.numberOfQuestions], function (err, result) {
                        done();
                        if (err) {
                            response.send(500);
                            return console.error("error running query", err);
                        } else {
                            response.json({
                                id: result.rows[0].id,
                                numberOfQuestions: result.rows[0].number_of_questions
                            });
                        }
                    });
            }
        });
    });
});

router.post("/testing/finish_test", function (request, response) {
    pg.connect(dbConnectionString, function (err, client, done) {
        if (err) {
            response.send(500);
            return console.error("error fetching client from pool", err);
        }
        client.query("UPDATE student_tests SET finished=true WHERE id=$1", [request.body.currentTest.id], function (err, result) { /*Refactor request.body.id */
            done();
            if (err) {
                response.send(500);
                return console.error("error running query", err);
            } else {
                response.send(200);
            }
        });
    });
});

router.get("testing/task", function (request, response) {
    pg.connect(dbConnectionString, function (err, client, done) {
        if (err) {
            response.send(500);
            return console.error("error fetching client from pool", err);
        }
        client.query("SELECT * FROM students_test WHERE id='test_settings'", function (err, result) {
            done();
            if (err) {
                response.send(500);
                return console.error("error running query", err);
            } else {
                var settings = result.rows[0].value;
                client.query("INSERT INTO student_tests(student_id, date, addition, subtraction, multiplication, division, " +
                    "number_of_questions) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
                    [request.body.id, new Date(), settings.addition, settings.subtraction, settings.multiplication, settings.division,
                        settings.numberOfQuestions], function (err, result) {
                        done();
                        if (err) {
                            response.send(500);
                            return console.error("error running query", err);
                        } else {
                            response.json({id: result.rows[0].id});
                        }
                    });
            }
        });
    });
});

router.post("/testing/tasks/next", function (request, response) {
    pg.connect(dbConnectionString, function (err, client, done) {
        if (err) {
            response.send(500);
            return console.error("error fetching client from pool", err);
        }
        client.query("SELECT * FROM application_settings WHERE key='test_settings'", function (err, result) {
            done();
            if (err) {
                response.send(500);
                return console.error("error running query", err);
            } else {
                var job = addOperation(result.rows[0].value);
                /*Add operation for create example*/
                var example = chooseOperation(job);
                client.query("INSERT INTO test_tasks (test_id, questions, correct_answer) values($1, $2, $3) RETURNING *", [request.body.id, example.question, example.result], function (err, result) {
                    done();
                    if (err) {
                        response.send(500);
                        return console.error("error running query", err);
                    } else {
                        response.json({question: example.question, id: result.rows[0].id});
                    }
                });
            }
        });
    });
});

router.post("/testing/tasks/answer", function (request, response) {
    pg.connect(dbConnectionString, function (err, client, done) {
        if (err) {
            response.send(500);
            return console.error("error fetching client from pool", err);
        }
        client.query("UPDATE test_tasks SET student_answer=$1 WHERE id=$2", [request.body.answer, request.body.taskId], function (err, result) {
            done();
            if (err) {
                response.send(500);
                return console.error("error running query", err);
            } else {
                response.send(200);
            }
        });
    });
});


router.post("/testing/tasks/correct", function (request, response) {
    pg.connect(dbConnectionString, function (err, client, done) {
        if (err) {
            response.send(500);
            return console.error("error fetching client from pool", err);
        }
        client.query("SELECT COUNT(*) FROM test_tasks WHERE test_id=$1 AND correct_answer = student_answer", [request.body.id], function (err, result) {
            done();
            if (err) {
                response.send(500);
                return console.error("error running query", err);
            } else {
                response.json({count: result.rows[0].count});
            }
        });
    });
});

router.post("/testing/tasks/incorrect", function (request, response) {
    pg.connect(dbConnectionString, function (err, client, done) {
        if (err) {
            response.send(500);
            return console.error("error fetching client from pool", err);
        }
        client.query("SELECT COUNT(*) FROM test_tasks WHERE test_id=$1 AND correct_answer <> student_answer", [request.body.id], function (err, result) {
            done();
            if (err) {
                response.send(500);
                return console.error("error running query", err);
            } else {
                response.json({count: result.rows[0].count});
            }
        });
    });
});

router.get("/reports/tested_students", function (request, response) {
    pg.connect(dbConnectionString, function (err, client, done) {
        if (err) {
            response.send(500);
            return console.error("error fetching client from pool", err);
        }
        client.query("SELECT *," +
            "(SELECT count(*) FROM test_tasks WHERE test_id=student_tests.id AND correct_answer=student_answer) AS correct_answers_count, " +
            "(SELECT count(*) FROM test_tasks WHERE test_id=student_tests.id AND correct_answer<>student_answer) AS incorrect_answers_count " +

            "FROM students " +
            "JOIN student_tests ON students.id = student_tests.student_id " +
            "WHERE finished= true ORDER BY date DESC, name", ['2016-05-01', '2016-05-09'], function (err, result) {
            done();
            if (err) {
                response.send(500);
                return console.error("error running query", err);
            } else {
                response.json({table: result.rows});
            }
        });
    });
});


router.get("/reports/not_tested_students", function (request, response) {
    pg.connect(dbConnectionString, function (err, client, done) {
        if (err) {
            response.send(500);
            return console.error("error fetching client from pool", err);
        }
        client.query("SELECT * FROM students LEFT JOIN student_tests ON students.id = student_tests.student_id WHERE finished is null;", function (err, result) {
            done();
            if (err) {
                response.send(500);
                return console.error("error running query", err);
            } else {
                response.json({table: result.rows});
            }
        });
    });
});

router.get("/reports/poor_students", function (request, response) {
    pg.connect(dbConnectionString, function (err, client, done) {
        if (err) {
            response.send(500);
            return console.error("error fetching client from pool", err);
        }
        client.query("SELECT name FROM (SELECT *," +
            "	((SELECT count(*) FROM test_tasks WHERE test_id=student_tests.id AND correct_answer=student_answer) * 100 / number_of_questions) AS success_percent" +
            " 	FROM students LEFT JOIN student_tests ON students.id = student_tests.student_id WHERE finished is true ) " +
            "AS bad_results WHERE success_percent < 50 GROUP BY name HAVING count(name) > 2;", function (err, result) {
                done();
                if (err) {
                    response.send(500);
                    return console.error("error running query", err);
                } else {
                    response.json({table: result.rows});
                }
            });
    });
});
application.use(bodyParser.urlencoded({extended: true}));
application.use(bodyParser.json());

application.use("/", express.static(__dirname + "/../client/application"));
application.use("/api", router);
application.listen(port);

console.log("Listening port " + port + "...");


function addOperation(setting) {
    var job = [];
    if (setting.addition) job.push(operationAddition);
    if (setting.subtraction) job.push(operationSubtraction);
    if (setting.multiplication) job.push(operationMultiplication);
    if (setting.division) job.push(operationDivision);
    return job;
}

function chooseOperation(job) {
    return job[Math.floor(Math.random() * job.length)]();
}


function operationAddition() {
    var a, b, result;
    result = Math.floor(80 + Math.random() * 20);
    a = Math.floor(10 + Math.random() * 50);
    b = result - a;

    return {
        question: a + " + " + b,
        result: result
    }

}

function operationSubtraction() {
    var a, b, result;
    result = Math.floor(1 + Math.random() * 100);
    b = Math.floor(1 + Math.random() * 50);
    a = b + result;

    return {
        question: a + " - " + b,
        result: result
    }
}

function operationMultiplication() {
    var a, b, result;
    a = Math.floor(1 + Math.random() * 10);
    b = Math.floor(1 + Math.random() * 10);
    result = a * b;

    return {
        question: a + " x " + b,
        result: result
    }
}

function operationDivision() {
    var a, b, result;
    b = Math.floor(1 + Math.random() * 10);
    result = Math.floor(1 + Math.random() * 10);
    a = b * result;

    return {
        question: a + " : " + b,
        result: result
    }
}



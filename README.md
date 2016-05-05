# softengi-test-students-task
Test task for Java Script Junior Developer position


1) Создала проект Ковалевская Светлана.
Тестовое задание на позицию Java Script Junior Developer.
Проект для тестирования знаний по математике, (Клиент + Сервер).

2) Чтобы запустить проект нужно установить psotgresqlю
Создать базу данных с именем "softingi".
Создать таблицы.

CREATE table application_settings(key VARCHAR(20) not null PRIMARY key, value JSON not null);
CREATE table students(id BIGSERIAL PRIMARY KEY, name VARCHAR(50) not null);
CREATE table student_tests(id BIGSERIAL PRIMARY KEY, student_id bigint REFERENCES students(id), date date, addition boolean, subtraction boolean, multiplication boolean, division boolean, number_of_questions integer);
CREATE table test_tasks(id BIGSERIAL PRIMARY KEY, test_id bigint REFERENCES student_tests(id), questions VARCHAR(50), correct_answer bigint, student_answer bigint);


3) Для сохранения настроек были использованы sql запросы:
-для обновления настроек:

SELECT * FROM application_settings WHERE key='test_settings';
UPDATE application_settings SET value=$1 WHERE key='test_settings'


4) Для добавления студента был использован запрос:

SELECT * FROM students WHERE name='name';


5) Для добавления тестов:
- получаю настройки;
- и заполняю таблицу student_tests

SELECT * FROM application_settings WHERE key='test_settings';
INSERT INTO student_tests(student_id, date, addition, subtraction, multiplication, division, number_of_questions) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;

- если студент прошел все тесты, добавляю finished=true

UPDATE student_tests SET finished=true WHERE id=$1;

- для вызова следующего примера делаю запрос настроек и добавляю запись в таблицу.

SELECT * FROM students_test WHERE id='test_settings'
INSERT INTO student_tests(student_id, date, addition, subtraction, multiplication, division, number_of_questions) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;

SELECT * FROM application_settings WHERE key='test_settings';
UPDATE test_tasks SET student_answer=$1 WHERE id=$2;

- два запроса для проверки результата (правельный, неправельный результат)
 SELECT COUNT(*) FROM test_tasks WHERE test_id=$1 AND correct_answer = student_answer;
 SELECT COUNT(*) FROM test_tasks WHERE test_id=$1 AND correct_answer <> student_answer;

6) Для получения отчетов:

Отчет 1. Показать учеников, прошедших тестирование за указанный период (имя, дата, типы решённых примеров),
кол-во правильно и неправильно решённых примеров, результат = % правильных ответов).
- Соединяю две таблицы по идентификатору студента, отбираю студентов которые закончили тест, сортирую по имени и дате.
Добавляю две новых колонки с количеством правельных и неправельных ответов.

 SELECT *,
    (SELECT count(*) FROM test_tasks WHERE test_id=student_tests.id AND correct_answer=student_answer) AS correct_answers_count,
    (SELECT count(*) FROM test_tasks WHERE test_id=student_tests.id AND correct_answer<>student_answer) AS incorrect_answers_count

    FROM students
    JOIN student_tests ON students.id = student_tests.student_id
    WHERE finished = true ORDER BY date DESC, name;


Отчет 2. Показать учеников, ни разу за период не проходивших тестирование.
- Соединяю две таблицы и отбираю студентов которые не писали тесты.

SELECT * FROM students LEFT JOIN student_tests ON students.id = student_tests.student_id WHERE finished is null;


Отчет 3. Ученики, проходившие тестирование не менее трёх раз за указанный период, результат которых не превысил 50%.
- Отбираю имена студентов, которые закончили тестирование на основании двух таблиц;
добавляю колонку Процент_успеваемости - считаю количество правельных ответов студента и узнаю процент успеваемости;
отбираю колонки, где процент успеваемости меньше 50 и группирую, чтобы количесто пройденых тестов было больше 2-х раз.

 SELECT name FROM (SELECT *,
        ((SELECT count(*) FROM test_tasks WHERE test_id=student_tests.id AND correct_answer=student_answer) * 100 / number_of_questions) AS success_percent
        FROM students LEFT JOIN student_tests ON students.id = student_tests.student_id WHERE finished is true )
        AS bad_results WHERE success_percent < 50 GROUP BY name HAVING count(name) > 2;
-- create example database and schema
DROP DATABASE IF EXISTS example;
CREATE DATABASE example DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_general_ci;
USE example;

DROP TABLE IF EXISTS people;
CREATE TABLE people (
    people_id INT NOT NULL AUTO_INCREMENT,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted BOOL NOT NULL DEFAULT 0,
    CONSTRAINT people_pk PRIMARY KEY (people_id)
);

-- add access permissions from any host
GRANT ALL ON *.* TO 'example'@'%' IDENTIFIED by 'example';
FLUSH PRIVILEGES;

-- seed dummy data
INSERT INTO people(firstname, lastname)
VALUES ('Danny', 'Navarro');

INSERT INTO people(firstname, lastname)
VALUES ('Jane', 'Doe');

INSERT INTO people(firstname, lastname)
VALUES ('Kanye', 'West');

INSERT INTO people(firstname, lastname)
VALUES ('Takeoff', '');

INSERT INTO people(firstname, lastname)
VALUES ('Quavo', '');

INSERT INTO people(firstname, lastname)
VALUES ('Billy', 'Joel');
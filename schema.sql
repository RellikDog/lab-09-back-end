DROP TABLE IF EXISTS weathers;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS meetups;
DROP TABLE IF EXISTS trails;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude NUMERIC,
    longitude NUMERIC
);

CREATE TABLE weathers (
    id SERIAL PRIMARY KEY,
    forecast VARCHAR(255),
    time VARCHAR(255),
    -- location_id INTEGER NOT NULL,
    -- FOREIGN KEY (location_id) REFERENCES locations (id),
    created_at NUMERIC 
);

CREATE TABLE meetups (
    id SERIAL PRIMARY KEY,
    link VARCHAR(255),
    name VARCHAR(255),
    creation_date NUMERIC,
    host VARCHAR(255),
    -- location_id INTEGER NOT NULL,
    -- FOREIGN KEY (location_id) REFERENCES locations (id),
    created_at NUMERIC
);

CREATE TABLE trails (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    location VARCHAR(255),
    length VARCHAR(255),
    stars NUMERIC,
    star_votes NUMERIC,
    summary TEXT,
    trail_url TEXT,
    conditions TEXT,
    conditionDate VARCHAR(255),
    conditionTime VARCHAR(255),
    -- location_id INTEGER NOT NULL,
    -- FOREIGN KEY (location_id) REFERENCES locations (id),
    created_at NUMERIC
);
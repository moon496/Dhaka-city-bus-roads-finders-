CREATE TABLE stops (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_bn VARCHAR(100)
);

CREATE TABLE routes (
  id SERIAL PRIMARY KEY,
  route_name VARCHAR(100) NOT NULL
);

CREATE TABLE route_stops (
  id SERIAL PRIMARY KEY,
  route_id INT REFERENCES routes(id) ON DELETE CASCADE,
  stop_id INT REFERENCES stops(id) ON DELETE CASCADE,
  stop_order INT NOT NULL
);

CREATE TABLE bus_services (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(100),
  name_bn VARCHAR(100),
  route_id INT REFERENCES routes(id) ON DELETE CASCADE
);
-- Runs once on first container start (empty data volume).
-- The primary database is created from POSTGRES_DB; this adds the isolated
-- database the test suite truncates and seeds without touching dev data.
CREATE DATABASE taskflow_test;

process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.PORT = process.env.PORT || "5001";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/airfare_test";
import { SQLDatabase } from "encore.dev/storage/sqldb";

export const feesDB = new SQLDatabase("school", {
  migrations: "./migrations",
});

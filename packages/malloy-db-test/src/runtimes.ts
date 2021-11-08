/*
 * Copyright 2021 Google LLC
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

import { Runtime, EmptyUrlReader, Result } from "@malloy-lang/malloy";
import { BigQueryConnection } from "@malloy-lang/db-bigquery";
import { PostgresConnection } from "@malloy-lang/db-postgres";

import { env } from "process";

const bqConnection = new BigQueryConnection("bigquery");
const postgresConnection = new PostgresConnection("postgres");
const files = new EmptyUrlReader();

export function getRuntimes(
  databaseList: string[] | undefined = undefined
): Map<string, Runtime> {
  const runtimes: Map<string, Runtime> = new Map<string, Runtime>(
    Object.entries({
      bigquery: new Runtime({
        urls: files,
        schemas: bqConnection,
        connections: bqConnection,
      }),
      postgres: new Runtime({
        urls: files,
        schemas: postgresConnection,
        connections: postgresConnection,
      }),
    })
  );

  const testDatabaseEnv = env.MALLOY_TEST_DATABASES;
  // const testDatabaseEnv = "bigquery,postgres";

  let databases;
  if (databaseList !== undefined) {
    databases = databaseList;
  } else if (testDatabaseEnv !== undefined) {
    databases = testDatabaseEnv.split(",");
  } else {
    databases = ["bigquery"];
  }
  for (const key of runtimes.keys()) {
    if (!databases.includes(key)) {
      runtimes.delete(key);
    }
  }
  return runtimes;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rows(qr: Result): any[] {
  return qr.getData().toObject();
}

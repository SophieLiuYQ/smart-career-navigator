import neo4j, { Driver } from "neo4j-driver";

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI || "bolt://localhost:7687";
    const user = process.env.NEO4J_USER || "neo4j";
    const password = process.env.NEO4J_PASSWORD || "careernavigator";

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionLifetime: 60000,
      connectionTimeout: 30000,
      maxConnectionPoolSize: 1,
    });
  }
  return driver;
}

export async function runQuery<T>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const d = getDriver();
  const session = d.session({ database: process.env.NEO4J_DATABASE || "neo4j" });
  try {
    const result = await session.run(cypher, params);
    return result.records.map((record) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj: any = record.toObject();
      // Convert Neo4j Integer types to JS numbers
      for (const key of Object.keys(obj)) {
        if (neo4j.isInt(obj[key])) {
          obj[key] = obj[key].toNumber();
        }
      }
      return obj as T;
    });
  } finally {
    await session.close();
  }
}

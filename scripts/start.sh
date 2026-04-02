#!/bin/bash
echo "=== Smart Career Navigator - Startup ==="

# Check Neo4j
echo "Checking Neo4j..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:7474 | grep -q "200"; then
  echo "  Neo4j is running on http://localhost:7474"
else
  echo "  Starting Neo4j..."
  brew services start neo4j
  sleep 5
fi

# Check if database is seeded
echo "Checking if database is seeded..."
ROLE_COUNT=$(curl -s -X POST "http://localhost:7474/db/neo4j/tx/commit" \
  -H "Content-Type: application/json" \
  -u neo4j:careernavigator \
  -d '{"statements":[{"statement":"MATCH (r:Role) RETURN count(r) as count"}]}' \
  | grep -o '"row":\[[0-9]*\]' | grep -o '[0-9]*')

if [ "$ROLE_COUNT" -gt 0 ] 2>/dev/null; then
  echo "  Database has $ROLE_COUNT roles. Skipping seed."
else
  echo "  Seeding database..."
  cd "$(dirname "$0")/.." && npx tsx scripts/seed.ts
fi

# Check RocketRide (optional)
echo "Checking RocketRide..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5565 2>/dev/null | grep -q "200"; then
  echo "  RocketRide is running on http://localhost:5565"
else
  echo "  RocketRide not detected. App will use direct Anthropic API fallback."
  echo "  To start RocketRide: docker compose up rocketride -d"
fi

# Start Next.js
echo ""
echo "Starting Next.js development server..."
cd "$(dirname "$0")/.." && npm run dev

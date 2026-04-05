# Smart Career Navigator

**Partnered with Shakarr Wiggins, Ph.D.in HackwithChicago 3.0**

**AI-Powered Career Path Intelligence** built with **Neo4j**, **RocketRide AI** (Hackathon requirements), and **Anthropic Claude**.

Search or type in your role, upload your resume, and discover realistic career paths to your dream role -- powered by graph-based skill matching and AI analysis.

**Website:** [smart-career-navigator.vercel.app](https://smart-career-navigator.vercel.app)

---
### Career Path Search & Analysis
![Search Demo](demo/demo_search.gif)

### Resume Upload & AI Parsing
![Resume Demo](demo/demo_resume.gif)
---

## Features

- **Resume Upload** -- Upload PDF/DOCX, Claude AI extracts skills, experience, and current role
- **Skill-Based Role Matching** -- Neo4j finds the best-fit role based on your skills
- **Skill Gap Analysis** -- Neo4j graph queries identify exactly which skills you need
- **D3 Force-Directed Graph** -- Interactive visualization of career path networks
- **Week-by-Week Curriculum** -- AI-generated learning timeline with prerequisite ordering
- **Resource Links** -- Links to Coursera, YouTube, Amazon, Udemy, and official docs
- **Salary & Growth Data** -- Real labor market data from O*NET
- **Skill Gap Visualization** -- Progress bars showing which skills you have versus you need
- **Related Roles** -- Alternative career paths to consider
- **Reddit Discussions** -- Live search of Reddit for career transition stories
- **AI Outreach Strategies** -- Personalized connection advice and conversation starters

---

## Architecture

```
                    +------------------+
                    |   Next.js App    |
                    |   (Vercel)       |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
     +--------v---+  +------v------+  +----v--------+
     |   Neo4j    |  | RocketRide  |  |  Anthropic  |
     |   Aura     |  |  Pipelines  |  |   Claude    |
     | (Graph DB) |  | (.pipe files)|  |   (AI)     |
     +------------+  +-------------+  +-------------+
```

### Neo4j (Graph Database)
- Self-expanding: new roles created automatically via AI
- Cypher queries for pathfinding, skill matching, and connection discovery
- Skill-based role matching for resume uploads

### RocketRide AI (Pipeline Engine)
- 4 pipeline definitions (`.pipe` files) that define AI workflow logic
- Each pipeline: webhook source -> data transform -> LLM node -> output
- Pipelines: career analysis, learning plans, connections, O*NET insights

### Anthropic Claude
- Resume parsing (reads PDFs directly via Claude's document understanding)
- Career path generation and analysis
- Learning curriculum design with real resource links
- Connection outreach strategy generation

---
## Getting Started

### Prerequisites
- Node.js 20+
- Neo4j (local via Homebrew or Neo4j Aura cloud)
- Anthropic API key

### Setup

```bash
# Clone the repo
git clone https://github.com/SophieLiuYQ/smart-career-navigator.git
cd smart-career-navigator

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your credentials:
#   NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
#   ANTHROPIC_API_KEY
#   AUTH_SECRET (generate with: openssl rand -base64 32)

# Seed the database
npx tsx scripts/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEO4J_URI` | Neo4j connection URI |
| `NEO4J_USER` | Neo4j username |
| `NEO4J_PASSWORD` | Neo4j password |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `AUTH_SECRET` | NextAuth.js secret |
| `AUTH_LINKEDIN_ID` | LinkedIn OAuth client ID (optional) |
| `AUTH_LINKEDIN_SECRET` | LinkedIn OAuth client secret (optional) |

---

## Project Structure

```
smart-career-navigator/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main UI with all tabs
│   │   ├── api/
│   │   │   ├── roles/                  # GET roles from Neo4j
│   │   │   ├── career-paths/           # Skill-first pathfinding
│   │   │   ├── skill-gap/              # Graph-based skill gap analysis
│   │   │   ├── learning-plan/          # AI curriculum + link validation
│   │   │   ├── connections/            # Graph-based networking
│   │   │   ├── community-stories/      # Reddit API integration
│   │   │   ├── onet-insights/          # O*NET labor market data
│   │   │   ├── upload-resume/          # Claude PDF parsing
│   │   │   ├── match-role/             # Skill-based role matching
│   │   │   └── auth/                   # NextAuth.js OAuth
│   ├── components/                     # React components
│   ├── lib/
│   │   ├── neo4j.ts                    # Neo4j driver
│   │   ├── anthropic.ts               # Claude API client
│   │   ├── rocketride.ts              # RocketRide pipeline client
│   │   ├── rocketride-engine.ts       # Pipeline executor (reads .pipe files)
│   │   ├── skill-pathfinder.ts        # AI-first career pathfinding
│   │   ├── role-matcher.ts            # AI role creation for unknown titles
│   │   ├── link-validator.ts          # URL validation for resources
│   │   └── auth.ts                    # NextAuth.js configuration
├── pipelines/
│   ├── career_path_analyzer.pipe       # RocketRide: career analysis
│   ├── learning_plan_generator.pipe    # RocketRide: learning plans
│   ├── connection_recommender.pipe     # RocketRide: networking
│   └── onet_analyzer.pipe             # RocketRide: O*NET extraction
├── scripts/
│   └── seed.ts                        # Neo4j database seeder
└── docker-compose.yml                 # Neo4j + RocketRide containers
```

---

## License

MIT

---

Built for the Neo4j x RocketRide AI Hackathon 2025

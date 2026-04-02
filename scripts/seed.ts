import neo4j from "neo4j-driver";

const URI = "bolt://localhost:7687";
const USER = "neo4j";
const PASSWORD = "careernavigator";

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

async function run(cypher: string, params: Record<string, unknown> = {}) {
  const session = driver.session();
  try {
    await session.run(cypher, params);
  } finally {
    await session.close();
  }
}

async function seed() {
  console.log("Clearing database...");
  await run("MATCH (n) DETACH DELETE n");

  // ============ ROLES ============
  console.log("Creating roles...");
  const roles = [
    { title: "Junior Software Engineer", level: "junior", avg_salary: 85000, demand_score: 8 },
    { title: "Software Engineer", level: "mid", avg_salary: 120000, demand_score: 9 },
    { title: "Senior Software Engineer", level: "senior", avg_salary: 160000, demand_score: 9 },
    { title: "Staff Engineer", level: "lead", avg_salary: 200000, demand_score: 7 },
    { title: "Principal Engineer", level: "principal", avg_salary: 250000, demand_score: 5 },
    { title: "Frontend Engineer", level: "mid", avg_salary: 115000, demand_score: 8 },
    { title: "Senior Frontend Engineer", level: "senior", avg_salary: 155000, demand_score: 7 },
    { title: "Backend Engineer", level: "mid", avg_salary: 125000, demand_score: 8 },
    { title: "Senior Backend Engineer", level: "senior", avg_salary: 165000, demand_score: 7 },
    { title: "Full Stack Developer", level: "mid", avg_salary: 118000, demand_score: 8 },
    { title: "DevOps Engineer", level: "mid", avg_salary: 130000, demand_score: 8 },
    { title: "Senior DevOps Engineer", level: "senior", avg_salary: 170000, demand_score: 7 },
    { title: "SRE", level: "mid", avg_salary: 140000, demand_score: 8 },
    { title: "Cloud Architect", level: "senior", avg_salary: 185000, demand_score: 7 },
    { title: "Data Analyst", level: "junior", avg_salary: 75000, demand_score: 7 },
    { title: "Senior Data Analyst", level: "mid", avg_salary: 100000, demand_score: 7 },
    { title: "Data Scientist", level: "mid", avg_salary: 135000, demand_score: 8 },
    { title: "Senior Data Scientist", level: "senior", avg_salary: 175000, demand_score: 7 },
    { title: "ML Engineer", level: "mid", avg_salary: 155000, demand_score: 9 },
    { title: "Senior ML Engineer", level: "senior", avg_salary: 195000, demand_score: 8 },
    { title: "AI Engineer", level: "mid", avg_salary: 165000, demand_score: 10 },
    { title: "Senior AI Engineer", level: "senior", avg_salary: 210000, demand_score: 9 },
    { title: "AI Research Scientist", level: "senior", avg_salary: 220000, demand_score: 7 },
    { title: "Product Manager", level: "mid", avg_salary: 135000, demand_score: 8 },
    { title: "Senior Product Manager", level: "senior", avg_salary: 175000, demand_score: 7 },
    { title: "Director of Product", level: "director", avg_salary: 220000, demand_score: 5 },
    { title: "Engineering Manager", level: "senior", avg_salary: 185000, demand_score: 7 },
    { title: "Senior Engineering Manager", level: "director", avg_salary: 220000, demand_score: 5 },
    { title: "Director of Engineering", level: "director", avg_salary: 260000, demand_score: 4 },
    { title: "VP of Engineering", level: "vp", avg_salary: 320000, demand_score: 3 },
    { title: "CTO", level: "vp", avg_salary: 350000, demand_score: 2 },
    { title: "UX Designer", level: "mid", avg_salary: 105000, demand_score: 7 },
    { title: "Senior UX Designer", level: "senior", avg_salary: 140000, demand_score: 6 },
    { title: "UX Research Lead", level: "lead", avg_salary: 160000, demand_score: 5 },
    { title: "QA Engineer", level: "mid", avg_salary: 90000, demand_score: 6 },
    { title: "SDET", level: "mid", avg_salary: 115000, demand_score: 7 },
    { title: "Security Engineer", level: "mid", avg_salary: 140000, demand_score: 8 },
    { title: "Senior Security Engineer", level: "senior", avg_salary: 180000, demand_score: 7 },
    { title: "Mobile Developer (iOS)", level: "mid", avg_salary: 125000, demand_score: 7 },
    { title: "Mobile Developer (Android)", level: "mid", avg_salary: 122000, demand_score: 7 },
    { title: "Senior Mobile Developer", level: "senior", avg_salary: 165000, demand_score: 6 },
    { title: "Solutions Architect", level: "senior", avg_salary: 170000, demand_score: 7 },
    { title: "Technical Program Manager", level: "senior", avg_salary: 165000, demand_score: 6 },
    { title: "Data Engineer", level: "mid", avg_salary: 140000, demand_score: 9 },
    { title: "Senior Data Engineer", level: "senior", avg_salary: 180000, demand_score: 8 },
    { title: "Analytics Engineer", level: "mid", avg_salary: 130000, demand_score: 8 },
    { title: "Platform Engineer", level: "mid", avg_salary: 145000, demand_score: 8 },
    { title: "Blockchain Developer", level: "mid", avg_salary: 150000, demand_score: 5 },
    { title: "Database Administrator", level: "mid", avg_salary: 110000, demand_score: 5 },
    { title: "Technical Writer", level: "mid", avg_salary: 90000, demand_score: 5 },
  ];

  for (const role of roles) {
    await run(
      `MERGE (r:Role {title: $title})
       SET r.level = $level, r.avg_salary = $avg_salary, r.demand_score = $demand_score`,
      role
    );
  }

  // ============ SKILLS ============
  console.log("Creating skills...");
  const skills = [
    { name: "Python", category: "Programming Language" },
    { name: "JavaScript", category: "Programming Language" },
    { name: "TypeScript", category: "Programming Language" },
    { name: "Java", category: "Programming Language" },
    { name: "Go", category: "Programming Language" },
    { name: "Rust", category: "Programming Language" },
    { name: "C++", category: "Programming Language" },
    { name: "Swift", category: "Programming Language" },
    { name: "Kotlin", category: "Programming Language" },
    { name: "SQL", category: "Programming Language" },
    { name: "R", category: "Programming Language" },
    { name: "Solidity", category: "Programming Language" },
    { name: "React", category: "Framework" },
    { name: "Angular", category: "Framework" },
    { name: "Vue.js", category: "Framework" },
    { name: "Next.js", category: "Framework" },
    { name: "Node.js", category: "Framework" },
    { name: "Django", category: "Framework" },
    { name: "FastAPI", category: "Framework" },
    { name: "Spring Boot", category: "Framework" },
    { name: "Express.js", category: "Framework" },
    { name: "Flask", category: "Framework" },
    { name: "React Native", category: "Mobile" },
    { name: "SwiftUI", category: "Mobile" },
    { name: "Jetpack Compose", category: "Mobile" },
    { name: "Flutter", category: "Mobile" },
    { name: "AWS", category: "Cloud" },
    { name: "GCP", category: "Cloud" },
    { name: "Azure", category: "Cloud" },
    { name: "Docker", category: "DevOps" },
    { name: "Kubernetes", category: "DevOps" },
    { name: "Terraform", category: "DevOps" },
    { name: "CI/CD", category: "DevOps" },
    { name: "GitHub Actions", category: "DevOps" },
    { name: "Ansible", category: "DevOps" },
    { name: "Prometheus", category: "DevOps" },
    { name: "Grafana", category: "DevOps" },
    { name: "Linux", category: "DevOps" },
    { name: "PostgreSQL", category: "Data" },
    { name: "MongoDB", category: "Data" },
    { name: "Redis", category: "Data" },
    { name: "Neo4j", category: "Data" },
    { name: "Elasticsearch", category: "Data" },
    { name: "DynamoDB", category: "Data" },
    { name: "Snowflake", category: "Data" },
    { name: "BigQuery", category: "Data" },
    { name: "Apache Spark", category: "Data" },
    { name: "Apache Kafka", category: "Data" },
    { name: "Airflow", category: "Data" },
    { name: "dbt", category: "Data" },
    { name: "ETL Pipelines", category: "Data" },
    { name: "TensorFlow", category: "AI/ML" },
    { name: "PyTorch", category: "AI/ML" },
    { name: "scikit-learn", category: "AI/ML" },
    { name: "LLMs", category: "AI/ML" },
    { name: "Prompt Engineering", category: "AI/ML" },
    { name: "RAG", category: "AI/ML" },
    { name: "Computer Vision", category: "AI/ML" },
    { name: "NLP", category: "AI/ML" },
    { name: "MLOps", category: "AI/ML" },
    { name: "Hugging Face", category: "AI/ML" },
    { name: "LangChain", category: "AI/ML" },
    { name: "Deep Learning", category: "AI/ML" },
    { name: "Statistics", category: "AI/ML" },
    { name: "Feature Engineering", category: "AI/ML" },
    { name: "Model Deployment", category: "AI/ML" },
    { name: "Data Visualization", category: "Data" },
    { name: "Tableau", category: "Data" },
    { name: "Power BI", category: "Data" },
    { name: "System Design", category: "Soft Skill" },
    { name: "Leadership", category: "Soft Skill" },
    { name: "Communication", category: "Soft Skill" },
    { name: "Project Management", category: "Soft Skill" },
    { name: "Agile", category: "Soft Skill" },
    { name: "Mentoring", category: "Soft Skill" },
    { name: "Stakeholder Management", category: "Soft Skill" },
    { name: "Technical Writing", category: "Soft Skill" },
    { name: "Figma", category: "Design" },
    { name: "User Research", category: "Design" },
    { name: "Prototyping", category: "Design" },
    { name: "Design Systems", category: "Design" },
    { name: "Accessibility", category: "Design" },
    { name: "GraphQL", category: "Framework" },
    { name: "REST APIs", category: "Framework" },
    { name: "Microservices", category: "Framework" },
    { name: "Git", category: "DevOps" },
    { name: "Networking", category: "Security" },
    { name: "Penetration Testing", category: "Security" },
    { name: "OWASP", category: "Security" },
    { name: "Cryptography", category: "Security" },
    { name: "Compliance", category: "Security" },
    { name: "Incident Response", category: "Security" },
    { name: "Threat Modeling", category: "Security" },
    { name: "Product Strategy", category: "Soft Skill" },
    { name: "A/B Testing", category: "Data" },
    { name: "Data Modeling", category: "Data" },
    { name: "Web3", category: "Framework" },
    { name: "Smart Contracts", category: "Framework" },
  ];

  for (const skill of skills) {
    await run(
      `MERGE (s:Skill {name: $name}) SET s.category = $category`,
      skill
    );
  }

  // ============ COMPANIES ============
  console.log("Creating companies...");
  const companies = [
    { name: "Google", industry: "Tech", size: "faang" },
    { name: "Meta", industry: "Tech", size: "faang" },
    { name: "Amazon", industry: "Tech", size: "faang" },
    { name: "Apple", industry: "Tech", size: "faang" },
    { name: "Microsoft", industry: "Tech", size: "faang" },
    { name: "Netflix", industry: "Entertainment", size: "large" },
    { name: "Stripe", industry: "Fintech", size: "large" },
    { name: "OpenAI", industry: "AI", size: "large" },
    { name: "Anthropic", industry: "AI", size: "mid" },
    { name: "Databricks", industry: "Data", size: "large" },
    { name: "Snowflake", industry: "Data", size: "large" },
    { name: "Uber", industry: "Mobility", size: "large" },
    { name: "Airbnb", industry: "Travel", size: "large" },
    { name: "Salesforce", industry: "SaaS", size: "large" },
    { name: "Spotify", industry: "Entertainment", size: "large" },
    { name: "LinkedIn", industry: "Social", size: "large" },
    { name: "Notion", industry: "Productivity", size: "mid" },
    { name: "Vercel", industry: "DevTools", size: "startup" },
    { name: "Supabase", industry: "DevTools", size: "startup" },
    { name: "Scale AI", industry: "AI", size: "mid" },
  ];

  for (const company of companies) {
    await run(
      `MERGE (c:Company {name: $name}) SET c.industry = $industry, c.size = $size`,
      company
    );
  }

  // ============ COURSES ============
  console.log("Creating courses...");
  const courses = [
    { name: "Machine Learning Specialization", provider: "Coursera", duration: "3 months", url: "https://coursera.org/ml-specialization", teaches: ["scikit-learn", "Statistics", "Python"] },
    { name: "Deep Learning Specialization", provider: "DeepLearning.AI", duration: "4 months", url: "https://deeplearning.ai/deep-learning", teaches: ["Deep Learning", "TensorFlow", "NLP"] },
    { name: "Practical Deep Learning for Coders", provider: "fast.ai", duration: "7 weeks", url: "https://course.fast.ai", teaches: ["PyTorch", "Deep Learning"] },
    { name: "Full Stack Open", provider: "University of Helsinki", duration: "3 months", url: "https://fullstackopen.com", teaches: ["React", "Node.js", "TypeScript"] },
    { name: "AWS Solutions Architect", provider: "Udemy", duration: "40 hours", url: "https://udemy.com/aws-sa", teaches: ["AWS", "System Design"] },
    { name: "Docker & Kubernetes Masterclass", provider: "Udemy", duration: "25 hours", url: "https://udemy.com/docker-k8s", teaches: ["Docker", "Kubernetes"] },
    { name: "Terraform Associate Certification", provider: "Pluralsight", duration: "20 hours", url: "https://pluralsight.com/terraform", teaches: ["Terraform", "AWS"] },
    { name: "LLM Engineering", provider: "DeepLearning.AI", duration: "6 weeks", url: "https://deeplearning.ai/llm", teaches: ["LLMs", "Prompt Engineering", "RAG"] },
    { name: "Natural Language Processing Specialization", provider: "Coursera", duration: "4 months", url: "https://coursera.org/nlp", teaches: ["NLP", "Python", "Deep Learning"] },
    { name: "Computer Vision with PyTorch", provider: "Udemy", duration: "30 hours", url: "https://udemy.com/cv-pytorch", teaches: ["Computer Vision", "PyTorch"] },
    { name: "Data Engineering with Python", provider: "Coursera", duration: "5 months", url: "https://coursera.org/data-eng", teaches: ["Apache Spark", "Airflow", "ETL Pipelines"] },
    { name: "dbt Fundamentals", provider: "dbt Labs", duration: "8 hours", url: "https://courses.getdbt.com", teaches: ["dbt", "SQL", "Data Modeling"] },
    { name: "Neo4j Graph Database Fundamentals", provider: "Neo4j", duration: "2 weeks", url: "https://graphacademy.neo4j.com", teaches: ["Neo4j", "Data Modeling"] },
    { name: "Apache Kafka for Beginners", provider: "Udemy", duration: "15 hours", url: "https://udemy.com/kafka", teaches: ["Apache Kafka"] },
    { name: "System Design Interview Prep", provider: "Educative", duration: "20 hours", url: "https://educative.io/system-design", teaches: ["System Design", "Microservices"] },
    { name: "Engineering Management 101", provider: "LinkedIn Learning", duration: "10 hours", url: "https://linkedin.com/learning/em101", teaches: ["Leadership", "Mentoring", "Communication"] },
    { name: "Product Management Certification", provider: "Coursera", duration: "6 months", url: "https://coursera.org/pm", teaches: ["Product Strategy", "A/B Testing", "Stakeholder Management"] },
    { name: "Google UX Design Certificate", provider: "Coursera", duration: "6 months", url: "https://coursera.org/ux-design", teaches: ["Figma", "User Research", "Prototyping"] },
    { name: "CompTIA Security+", provider: "Pluralsight", duration: "40 hours", url: "https://pluralsight.com/security-plus", teaches: ["Networking", "Cryptography", "Compliance"] },
    { name: "Ethical Hacking", provider: "Udemy", duration: "30 hours", url: "https://udemy.com/ethical-hacking", teaches: ["Penetration Testing", "OWASP"] },
    { name: "MLOps Specialization", provider: "DeepLearning.AI", duration: "4 months", url: "https://deeplearning.ai/mlops", teaches: ["MLOps", "Model Deployment", "Docker"] },
    { name: "LangChain for LLM Application Development", provider: "DeepLearning.AI", duration: "2 weeks", url: "https://deeplearning.ai/langchain", teaches: ["LangChain", "LLMs", "Python"] },
    { name: "React - The Complete Guide", provider: "Udemy", duration: "50 hours", url: "https://udemy.com/react-complete", teaches: ["React", "JavaScript", "Next.js"] },
    { name: "Go: The Complete Developer's Guide", provider: "Udemy", duration: "20 hours", url: "https://udemy.com/go-complete", teaches: ["Go", "REST APIs"] },
    { name: "Rust Programming", provider: "Udemy", duration: "25 hours", url: "https://udemy.com/rust", teaches: ["Rust"] },
    { name: "iOS Development with Swift", provider: "Udemy", duration: "35 hours", url: "https://udemy.com/ios-swift", teaches: ["Swift", "SwiftUI"] },
    { name: "Android Development with Kotlin", provider: "Udemy", duration: "35 hours", url: "https://udemy.com/android-kotlin", teaches: ["Kotlin", "Jetpack Compose"] },
    { name: "Figma UI/UX Design Essentials", provider: "Udemy", duration: "15 hours", url: "https://udemy.com/figma", teaches: ["Figma", "Design Systems"] },
    { name: "Blockchain Developer Bootcamp", provider: "Udemy", duration: "30 hours", url: "https://udemy.com/blockchain", teaches: ["Solidity", "Web3", "Smart Contracts"] },
    { name: "Data Visualization with Tableau", provider: "Coursera", duration: "5 weeks", url: "https://coursera.org/tableau", teaches: ["Tableau", "Data Visualization"] },
    { name: "Hugging Face NLP Course", provider: "Hugging Face", duration: "3 weeks", url: "https://huggingface.co/course", teaches: ["Hugging Face", "NLP", "LLMs"] },
    { name: "Feature Engineering for ML", provider: "Coursera", duration: "4 weeks", url: "https://coursera.org/feature-eng", teaches: ["Feature Engineering", "Python", "Statistics"] },
    { name: "GCP Cloud Engineer", provider: "Coursera", duration: "6 months", url: "https://coursera.org/gcp", teaches: ["GCP", "Docker", "Kubernetes"] },
    { name: "Azure Fundamentals", provider: "Pluralsight", duration: "15 hours", url: "https://pluralsight.com/azure", teaches: ["Azure"] },
    { name: "PostgreSQL Complete", provider: "Udemy", duration: "22 hours", url: "https://udemy.com/postgresql", teaches: ["PostgreSQL", "SQL"] },
    { name: "MongoDB University", provider: "MongoDB", duration: "4 weeks", url: "https://university.mongodb.com", teaches: ["MongoDB"] },
    { name: "GraphQL Complete Guide", provider: "Udemy", duration: "18 hours", url: "https://udemy.com/graphql", teaches: ["GraphQL", "Node.js"] },
    { name: "Agile Project Management", provider: "Coursera", duration: "6 weeks", url: "https://coursera.org/agile", teaches: ["Agile", "Project Management"] },
    { name: "Technical Writing Fundamentals", provider: "Coursera", duration: "4 weeks", url: "https://coursera.org/tech-writing", teaches: ["Technical Writing", "Communication"] },
    { name: "Snowflake Masterclass", provider: "Udemy", duration: "12 hours", url: "https://udemy.com/snowflake", teaches: ["Snowflake", "SQL"] },
  ];

  for (const course of courses) {
    await run(
      `MERGE (c:Course {name: $name})
       SET c.provider = $provider, c.duration = $duration, c.url = $url`,
      { name: course.name, provider: course.provider, duration: course.duration, url: course.url }
    );
    for (const skill of course.teaches) {
      await run(
        `MATCH (c:Course {name: $course}), (s:Skill {name: $skill})
         MERGE (c)-[:TEACHES]->(s)`,
        { course: course.name, skill }
      );
    }
  }

  // ============ ROLE -> REQUIRES_SKILL ============
  console.log("Creating role-skill requirements...");
  const roleSkills: Record<string, [string, number][]> = {
    "Junior Software Engineer": [["Python", 3], ["JavaScript", 3], ["Git", 4], ["SQL", 3], ["REST APIs", 3], ["Linux", 2]],
    "Software Engineer": [["Python", 4], ["JavaScript", 4], ["TypeScript", 3], ["Git", 5], ["SQL", 4], ["REST APIs", 4], ["Docker", 3], ["System Design", 2], ["CI/CD", 3]],
    "Senior Software Engineer": [["Python", 4], ["System Design", 5], ["TypeScript", 4], ["Docker", 4], ["Kubernetes", 3], ["Microservices", 4], ["CI/CD", 4], ["Mentoring", 3], ["AWS", 3], ["PostgreSQL", 4]],
    "Staff Engineer": [["System Design", 5], ["Leadership", 4], ["Microservices", 5], ["AWS", 4], ["Mentoring", 5], ["Communication", 4], ["Kubernetes", 4], ["Python", 4]],
    "Principal Engineer": [["System Design", 5], ["Leadership", 5], ["Communication", 5], ["Stakeholder Management", 4], ["Microservices", 5], ["AWS", 5], ["Mentoring", 5]],
    "Frontend Engineer": [["JavaScript", 5], ["TypeScript", 4], ["React", 5], ["CSS", 3], ["Next.js", 3], ["Git", 4], ["REST APIs", 3], ["Accessibility", 2]],
    "Senior Frontend Engineer": [["React", 5], ["TypeScript", 5], ["Next.js", 4], ["System Design", 3], ["Design Systems", 3], ["Accessibility", 3], ["GraphQL", 3], ["CI/CD", 3]],
    "Backend Engineer": [["Python", 4], ["Java", 4], ["SQL", 5], ["PostgreSQL", 4], ["REST APIs", 5], ["Docker", 3], ["Git", 4], ["Redis", 3]],
    "Senior Backend Engineer": [["Python", 5], ["System Design", 4], ["PostgreSQL", 5], ["Microservices", 4], ["Docker", 4], ["Kubernetes", 3], ["Redis", 4], ["Apache Kafka", 3], ["AWS", 4]],
    "Full Stack Developer": [["JavaScript", 4], ["TypeScript", 4], ["React", 4], ["Node.js", 4], ["SQL", 4], ["REST APIs", 4], ["Git", 4], ["Docker", 3]],
    "DevOps Engineer": [["Docker", 5], ["Kubernetes", 4], ["Terraform", 4], ["CI/CD", 5], ["Linux", 5], ["AWS", 4], ["Python", 3], ["GitHub Actions", 4], ["Prometheus", 3]],
    "Senior DevOps Engineer": [["Kubernetes", 5], ["Terraform", 5], ["AWS", 5], ["Docker", 5], ["CI/CD", 5], ["Linux", 5], ["Ansible", 4], ["Prometheus", 4], ["Grafana", 4], ["System Design", 3]],
    "SRE": [["Linux", 5], ["Docker", 4], ["Kubernetes", 4], ["Python", 4], ["Prometheus", 4], ["Grafana", 4], ["AWS", 4], ["System Design", 3], ["Incident Response", 3]],
    "Cloud Architect": [["AWS", 5], ["GCP", 4], ["Azure", 4], ["Terraform", 5], ["Kubernetes", 4], ["System Design", 5], ["Networking", 4], ["Docker", 4]],
    "Data Analyst": [["SQL", 5], ["Python", 3], ["Data Visualization", 4], ["Tableau", 4], ["Statistics", 3], ["A/B Testing", 3], ["Communication", 3]],
    "Senior Data Analyst": [["SQL", 5], ["Python", 4], ["Tableau", 5], ["Statistics", 4], ["A/B Testing", 4], ["Data Visualization", 5], ["Communication", 4], ["Power BI", 3]],
    "Data Scientist": [["Python", 5], ["Statistics", 5], ["scikit-learn", 4], ["SQL", 4], ["Deep Learning", 3], ["Feature Engineering", 4], ["Data Visualization", 3], ["NLP", 2]],
    "Senior Data Scientist": [["Python", 5], ["Deep Learning", 4], ["PyTorch", 4], ["Statistics", 5], ["Feature Engineering", 5], ["NLP", 4], ["Communication", 4], ["MLOps", 3]],
    "ML Engineer": [["Python", 5], ["PyTorch", 4], ["TensorFlow", 4], ["MLOps", 4], ["Docker", 4], ["Deep Learning", 4], ["Model Deployment", 4], ["AWS", 3], ["Feature Engineering", 3]],
    "Senior ML Engineer": [["PyTorch", 5], ["MLOps", 5], ["Model Deployment", 5], ["System Design", 4], ["Deep Learning", 5], ["Docker", 4], ["Kubernetes", 4], ["Python", 5], ["AWS", 4]],
    "AI Engineer": [["Python", 5], ["LLMs", 5], ["Prompt Engineering", 5], ["RAG", 4], ["LangChain", 4], ["PyTorch", 3], ["Docker", 3], ["REST APIs", 4], ["Hugging Face", 3], ["Deep Learning", 3]],
    "Senior AI Engineer": [["LLMs", 5], ["RAG", 5], ["LangChain", 5], ["Python", 5], ["System Design", 4], ["MLOps", 4], ["Deep Learning", 4], ["Model Deployment", 4], ["Prompt Engineering", 5]],
    "AI Research Scientist": [["Deep Learning", 5], ["PyTorch", 5], ["Python", 5], ["Statistics", 5], ["NLP", 4], ["Computer Vision", 4], ["LLMs", 4], ["C++", 3]],
    "Product Manager": [["Communication", 5], ["Product Strategy", 5], ["Agile", 4], ["A/B Testing", 3], ["SQL", 2], ["Stakeholder Management", 4], ["Data Visualization", 2]],
    "Senior Product Manager": [["Product Strategy", 5], ["Stakeholder Management", 5], ["Communication", 5], ["Agile", 4], ["A/B Testing", 4], ["Leadership", 3], ["SQL", 3]],
    "Director of Product": [["Leadership", 5], ["Product Strategy", 5], ["Stakeholder Management", 5], ["Communication", 5], ["Mentoring", 4]],
    "Engineering Manager": [["Leadership", 5], ["Communication", 5], ["Mentoring", 5], ["Agile", 4], ["System Design", 3], ["Project Management", 4], ["Stakeholder Management", 3]],
    "Senior Engineering Manager": [["Leadership", 5], ["Stakeholder Management", 5], ["Communication", 5], ["Mentoring", 5], ["Project Management", 5], ["System Design", 4]],
    "Director of Engineering": [["Leadership", 5], ["Stakeholder Management", 5], ["Communication", 5], ["System Design", 4], ["Mentoring", 5], ["Product Strategy", 3]],
    "VP of Engineering": [["Leadership", 5], ["Stakeholder Management", 5], ["Communication", 5], ["Product Strategy", 4], ["Mentoring", 5]],
    "CTO": [["Leadership", 5], ["System Design", 5], ["Communication", 5], ["Product Strategy", 5], ["Stakeholder Management", 5], ["Mentoring", 5]],
    "UX Designer": [["Figma", 5], ["User Research", 4], ["Prototyping", 4], ["Design Systems", 3], ["Communication", 3], ["Accessibility", 3]],
    "Senior UX Designer": [["Figma", 5], ["User Research", 5], ["Design Systems", 5], ["Prototyping", 5], ["Accessibility", 4], ["Communication", 4], ["Mentoring", 3]],
    "QA Engineer": [["Python", 3], ["SQL", 3], ["Git", 4], ["CI/CD", 3], ["REST APIs", 3], ["Linux", 2]],
    "SDET": [["Python", 4], ["TypeScript", 4], ["CI/CD", 4], ["Docker", 3], ["REST APIs", 4], ["Git", 5]],
    "Security Engineer": [["Networking", 5], ["Linux", 4], ["Python", 4], ["OWASP", 4], ["Cryptography", 3], ["Threat Modeling", 3], ["Docker", 3]],
    "Senior Security Engineer": [["Penetration Testing", 5], ["OWASP", 5], ["Cryptography", 4], ["Threat Modeling", 5], ["Incident Response", 4], ["Compliance", 4], ["Python", 4], ["Networking", 5]],
    "Mobile Developer (iOS)": [["Swift", 5], ["SwiftUI", 4], ["Git", 4], ["REST APIs", 4], ["CI/CD", 3]],
    "Mobile Developer (Android)": [["Kotlin", 5], ["Jetpack Compose", 4], ["Git", 4], ["REST APIs", 4], ["CI/CD", 3]],
    "Senior Mobile Developer": [["Swift", 4], ["Kotlin", 4], ["System Design", 3], ["CI/CD", 4], ["REST APIs", 4], ["Mentoring", 3]],
    "Solutions Architect": [["AWS", 5], ["System Design", 5], ["Communication", 4], ["Microservices", 4], ["Docker", 3], ["Kubernetes", 3], ["Networking", 3]],
    "Technical Program Manager": [["Project Management", 5], ["Communication", 5], ["Agile", 4], ["Stakeholder Management", 4], ["System Design", 2]],
    "Data Engineer": [["Python", 5], ["SQL", 5], ["Apache Spark", 4], ["Airflow", 4], ["ETL Pipelines", 5], ["Docker", 3], ["AWS", 3], ["Apache Kafka", 3]],
    "Senior Data Engineer": [["Apache Spark", 5], ["Airflow", 5], ["ETL Pipelines", 5], ["Python", 5], ["SQL", 5], ["Apache Kafka", 4], ["Docker", 4], ["Kubernetes", 3], ["System Design", 4], ["Snowflake", 4]],
    "Analytics Engineer": [["SQL", 5], ["dbt", 5], ["Python", 3], ["Data Modeling", 5], ["Snowflake", 4], ["BigQuery", 3], ["Data Visualization", 3]],
    "Platform Engineer": [["Kubernetes", 5], ["Docker", 5], ["Terraform", 4], ["CI/CD", 5], ["AWS", 4], ["Go", 3], ["Linux", 4], ["Python", 3]],
    "Blockchain Developer": [["Solidity", 5], ["JavaScript", 4], ["Web3", 5], ["Smart Contracts", 5], ["Cryptography", 3], ["Git", 4]],
    "Database Administrator": [["SQL", 5], ["PostgreSQL", 5], ["MongoDB", 4], ["Linux", 4], ["Python", 2], ["Redis", 3]],
    "Technical Writer": [["Technical Writing", 5], ["Communication", 5], ["Git", 3], ["Python", 2]],
  };

  for (const [role, skillList] of Object.entries(roleSkills)) {
    for (const [skill, importance] of skillList) {
      await run(
        `MATCH (r:Role {title: $role}), (s:Skill {name: $skill})
         MERGE (r)-[:REQUIRES_SKILL {importance: $importance}]->(s)`,
        { role, skill, importance }
      );
    }
  }

  // ============ CAREER TRANSITIONS (LEADS_TO) ============
  console.log("Creating career transitions...");
  const transitions = [
    // IC track - Software Engineering
    ["Junior Software Engineer", "Software Engineer", 0.85, 18],
    ["Software Engineer", "Senior Software Engineer", 0.7, 30],
    ["Senior Software Engineer", "Staff Engineer", 0.25, 36],
    ["Staff Engineer", "Principal Engineer", 0.15, 48],

    // Specialization from SWE
    ["Software Engineer", "Frontend Engineer", 0.3, 6],
    ["Software Engineer", "Backend Engineer", 0.3, 6],
    ["Software Engineer", "Full Stack Developer", 0.25, 6],
    ["Software Engineer", "DevOps Engineer", 0.15, 12],
    ["Software Engineer", "Data Engineer", 0.15, 12],
    ["Software Engineer", "ML Engineer", 0.1, 18],
    ["Software Engineer", "Security Engineer", 0.08, 12],
    ["Software Engineer", "Mobile Developer (iOS)", 0.1, 12],
    ["Software Engineer", "Mobile Developer (Android)", 0.1, 12],
    ["Software Engineer", "SDET", 0.1, 6],
    ["Software Engineer", "Blockchain Developer", 0.05, 12],

    // Frontend track
    ["Frontend Engineer", "Senior Frontend Engineer", 0.6, 24],
    ["Senior Frontend Engineer", "Staff Engineer", 0.15, 36],
    ["Frontend Engineer", "Full Stack Developer", 0.3, 12],
    ["Frontend Engineer", "UX Designer", 0.1, 18],

    // Backend track
    ["Backend Engineer", "Senior Backend Engineer", 0.6, 24],
    ["Senior Backend Engineer", "Staff Engineer", 0.15, 36],
    ["Backend Engineer", "Data Engineer", 0.15, 12],
    ["Backend Engineer", "DevOps Engineer", 0.1, 12],
    ["Backend Engineer", "Cloud Architect", 0.08, 24],
    ["Backend Engineer", "Platform Engineer", 0.1, 12],

    // DevOps / SRE / Cloud
    ["DevOps Engineer", "Senior DevOps Engineer", 0.6, 24],
    ["DevOps Engineer", "SRE", 0.3, 12],
    ["DevOps Engineer", "Platform Engineer", 0.25, 12],
    ["DevOps Engineer", "Cloud Architect", 0.15, 24],
    ["Senior DevOps Engineer", "Cloud Architect", 0.25, 18],
    ["SRE", "Cloud Architect", 0.2, 18],
    ["SRE", "Senior DevOps Engineer", 0.3, 12],
    ["Platform Engineer", "Cloud Architect", 0.2, 24],

    // Data Analyst track
    ["Data Analyst", "Senior Data Analyst", 0.6, 24],
    ["Data Analyst", "Data Scientist", 0.3, 18],
    ["Data Analyst", "Analytics Engineer", 0.25, 12],
    ["Data Analyst", "Data Engineer", 0.15, 18],
    ["Senior Data Analyst", "Data Scientist", 0.35, 12],
    ["Senior Data Analyst", "Product Manager", 0.15, 18],
    ["Analytics Engineer", "Senior Data Engineer", 0.2, 18],
    ["Analytics Engineer", "Data Scientist", 0.15, 18],

    // Data Science track
    ["Data Scientist", "Senior Data Scientist", 0.55, 30],
    ["Data Scientist", "ML Engineer", 0.35, 12],
    ["Data Scientist", "AI Engineer", 0.2, 18],
    ["Senior Data Scientist", "ML Engineer", 0.3, 12],
    ["Senior Data Scientist", "AI Research Scientist", 0.15, 24],
    ["Senior Data Scientist", "Engineering Manager", 0.1, 18],

    // ML / AI track
    ["ML Engineer", "Senior ML Engineer", 0.5, 24],
    ["ML Engineer", "AI Engineer", 0.4, 12],
    ["ML Engineer", "AI Research Scientist", 0.1, 24],
    ["Senior ML Engineer", "AI Engineer", 0.35, 6],
    ["Senior ML Engineer", "Senior AI Engineer", 0.25, 12],
    ["Senior ML Engineer", "Staff Engineer", 0.15, 24],
    ["AI Engineer", "Senior AI Engineer", 0.5, 24],
    ["Senior AI Engineer", "Staff Engineer", 0.2, 24],
    ["Senior AI Engineer", "AI Research Scientist", 0.15, 18],

    // Data Engineering
    ["Data Engineer", "Senior Data Engineer", 0.55, 24],
    ["Data Engineer", "ML Engineer", 0.15, 18],
    ["Data Engineer", "Analytics Engineer", 0.2, 12],
    ["Senior Data Engineer", "Staff Engineer", 0.15, 36],
    ["Senior Data Engineer", "Data Scientist", 0.1, 18],
    ["Senior Data Engineer", "Cloud Architect", 0.1, 18],

    // Management track
    ["Senior Software Engineer", "Engineering Manager", 0.3, 18],
    ["Staff Engineer", "Engineering Manager", 0.2, 12],
    ["Staff Engineer", "Director of Engineering", 0.1, 36],
    ["Engineering Manager", "Senior Engineering Manager", 0.4, 30],
    ["Senior Engineering Manager", "Director of Engineering", 0.3, 30],
    ["Director of Engineering", "VP of Engineering", 0.2, 36],
    ["VP of Engineering", "CTO", 0.15, 48],
    ["Principal Engineer", "CTO", 0.05, 48],

    // Product track
    ["Software Engineer", "Product Manager", 0.08, 18],
    ["Senior Software Engineer", "Product Manager", 0.1, 12],
    ["Product Manager", "Senior Product Manager", 0.5, 24],
    ["Senior Product Manager", "Director of Product", 0.25, 30],

    // Cross-functional
    ["Software Engineer", "Technical Program Manager", 0.05, 18],
    ["Senior Software Engineer", "Solutions Architect", 0.15, 12],
    ["Senior Software Engineer", "Technical Program Manager", 0.08, 12],
    ["Engineering Manager", "Technical Program Manager", 0.1, 6],
    ["Engineering Manager", "Director of Engineering", 0.2, 30],
    ["Engineering Manager", "Product Manager", 0.1, 12],

    // Mobile
    ["Mobile Developer (iOS)", "Senior Mobile Developer", 0.5, 24],
    ["Mobile Developer (Android)", "Senior Mobile Developer", 0.5, 24],
    ["Senior Mobile Developer", "Engineering Manager", 0.15, 24],
    ["Senior Mobile Developer", "Staff Engineer", 0.1, 30],

    // Design track
    ["UX Designer", "Senior UX Designer", 0.5, 24],
    ["Senior UX Designer", "UX Research Lead", 0.3, 24],
    ["Senior UX Designer", "Product Manager", 0.1, 18],

    // QA / Security
    ["QA Engineer", "SDET", 0.4, 12],
    ["QA Engineer", "Software Engineer", 0.2, 18],
    ["SDET", "Software Engineer", 0.3, 12],
    ["SDET", "DevOps Engineer", 0.15, 12],
    ["Security Engineer", "Senior Security Engineer", 0.5, 24],
    ["Senior Security Engineer", "Cloud Architect", 0.1, 24],

    // Alt paths to AI Engineer (important for demo)
    ["Software Engineer", "AI Engineer", 0.05, 24],
    ["Senior Software Engineer", "AI Engineer", 0.1, 18],
    ["Senior Software Engineer", "ML Engineer", 0.12, 18],
    ["Full Stack Developer", "AI Engineer", 0.05, 24],
    ["Data Engineer", "AI Engineer", 0.08, 24],

    // DBA paths
    ["Database Administrator", "Data Engineer", 0.25, 12],
    ["Database Administrator", "Backend Engineer", 0.15, 12],

    // Technical Writer
    ["Technical Writer", "Product Manager", 0.1, 24],

    // Blockchain
    ["Blockchain Developer", "Senior Software Engineer", 0.1, 18],
  ];

  for (const [from, to, frequency, months] of transitions) {
    await run(
      `MATCH (a:Role {title: $from}), (b:Role {title: $to})
       MERGE (a)-[:LEADS_TO {frequency: $frequency, avg_transition_months: $months}]->(b)`,
      { from, to, frequency, months }
    );
  }

  // ============ SKILL PREREQUISITES ============
  console.log("Creating skill prerequisites...");
  const prerequisites = [
    ["Python", "PyTorch"], ["Python", "TensorFlow"], ["Python", "scikit-learn"],
    ["Python", "Django"], ["Python", "FastAPI"], ["Python", "Flask"],
    ["Python", "Deep Learning"], ["Python", "LangChain"],
    ["JavaScript", "React"], ["JavaScript", "Angular"], ["JavaScript", "Vue.js"],
    ["JavaScript", "Node.js"], ["JavaScript", "Express.js"], ["JavaScript", "Next.js"],
    ["TypeScript", "Next.js"], ["TypeScript", "Angular"],
    ["React", "Next.js"],
    ["Statistics", "scikit-learn"], ["Statistics", "Feature Engineering"],
    ["Statistics", "A/B Testing"],
    ["Deep Learning", "LLMs"], ["Deep Learning", "Computer Vision"],
    ["Deep Learning", "NLP"], ["Deep Learning", "PyTorch"],
    ["LLMs", "Prompt Engineering"], ["LLMs", "RAG"], ["LLMs", "LangChain"],
    ["Docker", "Kubernetes"], ["Docker", "MLOps"],
    ["Linux", "Docker"], ["Linux", "Kubernetes"],
    ["AWS", "Terraform"],
    ["SQL", "PostgreSQL"], ["SQL", "dbt"], ["SQL", "Snowflake"], ["SQL", "BigQuery"],
    ["SQL", "Data Modeling"],
    ["Git", "CI/CD"], ["Git", "GitHub Actions"],
    ["Java", "Spring Boot"], ["Swift", "SwiftUI"], ["Kotlin", "Jetpack Compose"],
    ["Solidity", "Smart Contracts"], ["JavaScript", "Web3"],
    ["Figma", "Design Systems"], ["User Research", "Prototyping"],
    ["Networking", "Penetration Testing"], ["Cryptography", "OWASP"],
    ["Python", "Airflow"], ["Python", "Apache Spark"],
    ["scikit-learn", "Feature Engineering"], ["PyTorch", "Hugging Face"],
    ["MLOps", "Model Deployment"],
  ];

  for (const [prereq, skill] of prerequisites) {
    await run(
      `MATCH (a:Skill {name: $prereq}), (b:Skill {name: $skill})
       MERGE (a)-[:PREREQUISITE_FOR]->(b)`,
      { prereq, skill }
    );
  }

  // ============ PEOPLE ============
  console.log("Creating people...");
  const people = [
    { name: "Sarah Chen", years_exp: 8, company: "Google", currentRole: "AI Engineer", previousRoles: [["Software Engineer", 30], ["ML Engineer", 18]], skills: [["Python", 5], ["LLMs", 5], ["PyTorch", 4], ["RAG", 4], ["Docker", 3], ["AWS", 3]] },
    { name: "Marcus Johnson", years_exp: 12, company: "Meta", currentRole: "Staff Engineer", previousRoles: [["Software Engineer", 24], ["Senior Software Engineer", 36]], skills: [["Python", 5], ["System Design", 5], ["Microservices", 5], ["AWS", 4], ["Leadership", 4]] },
    { name: "Priya Sharma", years_exp: 6, company: "Anthropic", currentRole: "ML Engineer", previousRoles: [["Data Scientist", 24], ["Software Engineer", 18]], skills: [["Python", 5], ["PyTorch", 5], ["Deep Learning", 4], ["MLOps", 4], ["LLMs", 4]] },
    { name: "David Kim", years_exp: 10, company: "Amazon", currentRole: "Engineering Manager", previousRoles: [["Software Engineer", 24], ["Senior Software Engineer", 36]], skills: [["Leadership", 5], ["System Design", 4], ["Java", 4], ["Communication", 5], ["Mentoring", 5]] },
    { name: "Emma Wilson", years_exp: 7, company: "Stripe", currentRole: "Senior Software Engineer", previousRoles: [["Junior Software Engineer", 18], ["Software Engineer", 30]], skills: [["TypeScript", 5], ["React", 5], ["Node.js", 4], ["PostgreSQL", 4], ["System Design", 4]] },
    { name: "Alex Rivera", years_exp: 5, company: "OpenAI", currentRole: "AI Engineer", previousRoles: [["Software Engineer", 18], ["Data Scientist", 18]], skills: [["Python", 5], ["LLMs", 5], ["Prompt Engineering", 5], ["RAG", 5], ["Deep Learning", 4]] },
    { name: "Lisa Zhang", years_exp: 9, company: "Databricks", currentRole: "Senior Data Engineer", previousRoles: [["Software Engineer", 18], ["Data Engineer", 30]], skills: [["Python", 5], ["Apache Spark", 5], ["SQL", 5], ["Airflow", 5], ["AWS", 4]] },
    { name: "James Taylor", years_exp: 15, company: "Microsoft", currentRole: "Director of Engineering", previousRoles: [["Software Engineer", 24], ["Senior Software Engineer", 30], ["Engineering Manager", 36]], skills: [["Leadership", 5], ["System Design", 5], ["Communication", 5], ["Stakeholder Management", 5]] },
    { name: "Nina Patel", years_exp: 4, company: "Scale AI", currentRole: "Data Scientist", previousRoles: [["Data Analyst", 24]], skills: [["Python", 5], ["Statistics", 5], ["scikit-learn", 4], ["SQL", 4], ["Deep Learning", 3]] },
    { name: "Ryan O'Brien", years_exp: 6, company: "Netflix", currentRole: "Senior DevOps Engineer", previousRoles: [["Software Engineer", 18], ["DevOps Engineer", 24]], skills: [["Kubernetes", 5], ["Docker", 5], ["Terraform", 5], ["AWS", 5], ["Linux", 5]] },
    { name: "Mei Lin", years_exp: 7, company: "Snowflake", currentRole: "Senior ML Engineer", previousRoles: [["Software Engineer", 18], ["ML Engineer", 30]], skills: [["Python", 5], ["PyTorch", 5], ["MLOps", 5], ["Deep Learning", 5], ["Model Deployment", 5]] },
    { name: "Carlos Mendez", years_exp: 5, company: "Uber", currentRole: "Data Engineer", previousRoles: [["Data Analyst", 18], ["Analytics Engineer", 18]], skills: [["Python", 4], ["SQL", 5], ["Apache Spark", 4], ["Airflow", 4], ["dbt", 4]] },
    { name: "Aisha Hassan", years_exp: 8, company: "Airbnb", currentRole: "Senior Product Manager", previousRoles: [["Software Engineer", 24], ["Product Manager", 30]], skills: [["Product Strategy", 5], ["Communication", 5], ["A/B Testing", 4], ["SQL", 3], ["Stakeholder Management", 5]] },
    { name: "Tom Nakamura", years_exp: 6, company: "Apple", currentRole: "Senior Mobile Developer", previousRoles: [["Mobile Developer (iOS)", 30], ["Software Engineer", 18]], skills: [["Swift", 5], ["SwiftUI", 5], ["System Design", 4], ["CI/CD", 4]] },
    { name: "Rachel Green", years_exp: 5, company: "Notion", currentRole: "Senior Frontend Engineer", previousRoles: [["Frontend Engineer", 24], ["Full Stack Developer", 12]], skills: [["React", 5], ["TypeScript", 5], ["Next.js", 5], ["Design Systems", 4], ["GraphQL", 4]] },
    { name: "Ahmed Al-Rashid", years_exp: 7, company: "Google", currentRole: "Cloud Architect", previousRoles: [["DevOps Engineer", 24], ["Senior DevOps Engineer", 24]], skills: [["AWS", 5], ["GCP", 5], ["Terraform", 5], ["Kubernetes", 5], ["System Design", 5]] },
    { name: "Sophie Martin", years_exp: 4, company: "Vercel", currentRole: "Frontend Engineer", previousRoles: [["Junior Software Engineer", 18]], skills: [["React", 5], ["TypeScript", 4], ["Next.js", 4], ["JavaScript", 5], ["Git", 4]] },
    { name: "Kevin Park", years_exp: 9, company: "Salesforce", currentRole: "Solutions Architect", previousRoles: [["Software Engineer", 24], ["Senior Software Engineer", 30]], skills: [["AWS", 5], ["System Design", 5], ["Microservices", 4], ["Communication", 5], ["Docker", 4]] },
    { name: "Diana Volkov", years_exp: 6, company: "Supabase", currentRole: "Senior Backend Engineer", previousRoles: [["Software Engineer", 18], ["Backend Engineer", 24]], skills: [["Python", 5], ["PostgreSQL", 5], ["Go", 4], ["Docker", 4], ["REST APIs", 5]] },
    { name: "Jamal Washington", years_exp: 8, company: "LinkedIn", currentRole: "Senior Data Scientist", previousRoles: [["Data Analyst", 18], ["Data Scientist", 30]], skills: [["Python", 5], ["Statistics", 5], ["Deep Learning", 4], ["NLP", 5], ["PyTorch", 4]] },
    { name: "Laura Schmidt", years_exp: 5, company: "Spotify", currentRole: "ML Engineer", previousRoles: [["Software Engineer", 18], ["Data Engineer", 18]], skills: [["Python", 5], ["PyTorch", 4], ["TensorFlow", 4], ["MLOps", 4], ["Docker", 4]] },
    { name: "Chris Wong", years_exp: 11, company: "Amazon", currentRole: "Principal Engineer", previousRoles: [["Software Engineer", 24], ["Senior Software Engineer", 30], ["Staff Engineer", 36]], skills: [["System Design", 5], ["Leadership", 5], ["AWS", 5], ["Microservices", 5], ["Communication", 5]] },
    { name: "Fatima Al-Sayed", years_exp: 4, company: "Anthropic", currentRole: "AI Engineer", previousRoles: [["ML Engineer", 18], ["Software Engineer", 18]], skills: [["Python", 5], ["LLMs", 5], ["RAG", 5], ["LangChain", 5], ["Prompt Engineering", 5]] },
    { name: "Mike O'Sullivan", years_exp: 7, company: "Meta", currentRole: "Senior Security Engineer", previousRoles: [["Software Engineer", 18], ["Security Engineer", 24]], skills: [["Penetration Testing", 5], ["OWASP", 5], ["Python", 4], ["Networking", 5], ["Threat Modeling", 5]] },
    { name: "Yuki Tanaka", years_exp: 5, company: "Google", currentRole: "SRE", previousRoles: [["Software Engineer", 12], ["DevOps Engineer", 18]], skills: [["Linux", 5], ["Kubernetes", 5], ["Python", 4], ["Prometheus", 5], ["Grafana", 4]] },
    { name: "Isabella Costa", years_exp: 6, company: "Databricks", currentRole: "Analytics Engineer", previousRoles: [["Data Analyst", 24], ["Senior Data Analyst", 18]], skills: [["SQL", 5], ["dbt", 5], ["Python", 4], ["Data Modeling", 5], ["Snowflake", 4]] },
    { name: "Ben Foster", years_exp: 4, company: "Notion", currentRole: "Full Stack Developer", previousRoles: [["Junior Software Engineer", 18]], skills: [["JavaScript", 5], ["TypeScript", 4], ["React", 4], ["Node.js", 4], ["SQL", 4]] },
    { name: "Hannah Lee", years_exp: 5, company: "Stripe", currentRole: "Senior UX Designer", previousRoles: [["UX Designer", 30]], skills: [["Figma", 5], ["User Research", 5], ["Prototyping", 5], ["Design Systems", 5], ["Accessibility", 4]] },
    { name: "Omar Khan", years_exp: 3, company: "Scale AI", currentRole: "Data Analyst", previousRoles: [], skills: [["SQL", 4], ["Python", 3], ["Tableau", 4], ["Statistics", 3], ["Data Visualization", 4]] },
    { name: "Tina Nguyen", years_exp: 7, company: "Microsoft", currentRole: "Technical Program Manager", previousRoles: [["Software Engineer", 18], ["Senior Software Engineer", 24]], skills: [["Project Management", 5], ["Communication", 5], ["Agile", 5], ["Stakeholder Management", 5]] },
  ];

  for (const person of people) {
    await run(
      `MERGE (p:Person {name: $name}) SET p.years_exp = $years_exp`,
      { name: person.name, years_exp: person.years_exp }
    );
    await run(
      `MATCH (p:Person {name: $name}), (c:Company {name: $company}) MERGE (p)-[:WORKS_AT]->(c)`,
      { name: person.name, company: person.company }
    );
    await run(
      `MATCH (p:Person {name: $name}), (r:Role {title: $role}) MERGE (p)-[:HOLDS_ROLE]->(r)`,
      { name: person.name, role: person.currentRole }
    );
    for (const [role, duration] of person.previousRoles) {
      await run(
        `MATCH (p:Person {name: $name}), (r:Role {title: $role}) MERGE (p)-[:PREVIOUSLY_HELD {duration_months: $duration}]->(r)`,
        { name: person.name, role, duration }
      );
    }
    for (const [skill, proficiency] of person.skills) {
      await run(
        `MATCH (p:Person {name: $name}), (s:Skill {name: $skill}) MERGE (p)-[:HAS_SKILL {proficiency: $proficiency}]->(s)`,
        { name: person.name, skill, proficiency }
      );
    }
  }

  // ============ COMPANY HIRES FOR ============
  console.log("Creating company hiring relationships...");
  const companyHires: Record<string, string[]> = {
    "Google": ["Software Engineer", "Senior Software Engineer", "Staff Engineer", "ML Engineer", "AI Engineer", "SRE", "Cloud Architect", "Product Manager", "Engineering Manager", "Data Scientist"],
    "Meta": ["Software Engineer", "Senior Software Engineer", "Staff Engineer", "ML Engineer", "AI Engineer", "Product Manager", "Data Scientist", "Senior Security Engineer"],
    "Amazon": ["Software Engineer", "Senior Software Engineer", "Data Engineer", "DevOps Engineer", "Solutions Architect", "Engineering Manager", "Principal Engineer"],
    "Apple": ["Software Engineer", "Mobile Developer (iOS)", "Senior Mobile Developer", "ML Engineer", "UX Designer", "Senior UX Designer"],
    "Microsoft": ["Software Engineer", "Senior Software Engineer", "Cloud Architect", "Data Scientist", "Product Manager", "Technical Program Manager", "Director of Engineering"],
    "Netflix": ["Senior Software Engineer", "Senior DevOps Engineer", "Data Scientist", "ML Engineer", "Staff Engineer"],
    "Stripe": ["Software Engineer", "Senior Software Engineer", "Senior Frontend Engineer", "Senior UX Designer", "Data Engineer"],
    "OpenAI": ["AI Engineer", "Senior AI Engineer", "AI Research Scientist", "ML Engineer", "Software Engineer"],
    "Anthropic": ["AI Engineer", "Senior AI Engineer", "ML Engineer", "AI Research Scientist", "Software Engineer"],
    "Databricks": ["Data Engineer", "Senior Data Engineer", "ML Engineer", "Senior ML Engineer", "Analytics Engineer"],
    "Snowflake": ["Data Engineer", "Senior Data Engineer", "Senior ML Engineer", "Backend Engineer", "Cloud Architect"],
    "Uber": ["Software Engineer", "Data Engineer", "ML Engineer", "Backend Engineer", "Senior Software Engineer"],
    "Airbnb": ["Software Engineer", "Frontend Engineer", "Data Scientist", "Product Manager", "Senior Product Manager"],
    "Salesforce": ["Software Engineer", "Solutions Architect", "Product Manager", "Cloud Architect"],
    "Spotify": ["Software Engineer", "ML Engineer", "Data Engineer", "Backend Engineer", "Frontend Engineer"],
    "LinkedIn": ["Software Engineer", "Data Scientist", "Senior Data Scientist", "AI Engineer", "Product Manager"],
    "Notion": ["Full Stack Developer", "Frontend Engineer", "Senior Frontend Engineer", "Backend Engineer", "UX Designer"],
    "Vercel": ["Frontend Engineer", "Senior Frontend Engineer", "DevOps Engineer", "Full Stack Developer"],
    "Supabase": ["Backend Engineer", "Senior Backend Engineer", "DevOps Engineer", "Full Stack Developer"],
    "Scale AI": ["AI Engineer", "ML Engineer", "Data Scientist", "Data Analyst", "Software Engineer"],
  };

  for (const [company, rolesList] of Object.entries(companyHires)) {
    for (const role of rolesList) {
      await run(
        `MATCH (c:Company {name: $company}), (r:Role {title: $role}) MERGE (c)-[:HIRES_FOR]->(r)`,
        { company, role }
      );
    }
  }

  // ============ INDEXES ============
  console.log("Creating indexes...");
  await run("CREATE INDEX IF NOT EXISTS FOR (r:Role) ON (r.title)");
  await run("CREATE INDEX IF NOT EXISTS FOR (s:Skill) ON (s.name)");
  await run("CREATE INDEX IF NOT EXISTS FOR (p:Person) ON (p.name)");
  await run("CREATE INDEX IF NOT EXISTS FOR (c:Company) ON (c.name)");
  await run("CREATE INDEX IF NOT EXISTS FOR (c:Course) ON (c.name)");

  console.log("\nSeeding complete!");
  console.log("- 50 Roles");
  console.log("- ~100 Skills");
  console.log("- 20 Companies");
  console.log("- 40 Courses");
  console.log("- 30 People");
  console.log("- 100+ Career transitions");
  console.log("- 50+ Skill prerequisites");

  await driver.close();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  driver.close();
  process.exit(1);
});

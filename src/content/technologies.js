/**
 * Stack we work in. Split into two rows so the marquee can run them in
 * opposite directions.
 */
export const technologies = [
  "TypeScript", "React", "Next.js", "Node.js", "Python", "Go", "Rust",
  "PostgreSQL", "Redis", "Kafka", "ClickHouse", "Elasticsearch",
  "AWS", "Google Cloud", "Kubernetes", "Terraform", "Docker",
  "React Native", "Swift", "Kotlin",
  "PyTorch", "LangGraph", "pgvector", "Temporal",
];

export const techRows = [
  technologies.slice(0, 12),
  technologies.slice(12),
];

export const trustedBy = [
  "Northwind Logistics",
  "Meridian Health",
  "Atlas Payments",
  "Kestrel Robotics",
  "Halden Energy",
  "Vantage Retail",
  "Orbital Freight",
  "Lumen Diagnostics",
];

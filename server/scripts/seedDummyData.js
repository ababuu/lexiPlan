import fs from "fs/promises";
import path from "path";

async function seed() {
  const out = {
    orgs: [{ id: "org-temp-1", name: "Acme Temp Org", isActive: true }],
    projects: [
      { id: "proj-temp-1", orgId: "org-temp-1", title: "Demo Project" },
    ],
    createdAt: new Date().toISOString(),
  };

  const p = path.resolve(process.cwd(), "server", "tmp", "seed.json");
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(out, null, 2), "utf8");
  console.log("Wrote temporary seed to", p);
}

if (process.argv[2] === "run") {
  seed().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export default seed;

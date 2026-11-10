// Reads {"canonical": [...], "demo": [...]} on stdin and prints both engines' JS results as JSON.
const engine = require("../web/rules-engine.js");
let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  const { canonical = [], demo = [] } = JSON.parse(input);
  const slim = (r) => ({
    rule_ids: r.triggered_rules.map((x) => x.rule_id),
    total_score: r.total_score, risk_level: r.risk_level, decision: r.decision,
    missing_information: r.missing_information, reviewer_path: r.reviewer_path,
  });
  const out = {
    canonical: canonical.map((c) => slim(engine.assess(c))),
    demo: demo.map((d) => {
      const c = engine.fromDemoIntake(d.intake, d.id);
      return { canonical: c, result: slim(engine.assess(c)) };
    }),
  };
  process.stdout.write(JSON.stringify(out));
});

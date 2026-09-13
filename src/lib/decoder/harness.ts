import {
  AcquisitionEvent,
  Artifact,
  DependencyError,
  DependencyType,
  Evidence,
  EvidenceEngine,
  EvidenceRelationship,
  EvidenceType,
  FactorAssessment,
  EpistemicStatus,
  FactorStrength,
  InvariantViolation,
  AnalystInterpretation,
  Proposition,
  PropositionType,
  Source,
  SourceAssertion,
  UtcDateTime,
  definitiveVector,
} from "./evidence";

export type HarnessResult = {
  test: string;
  passed: boolean;
  detail: string;
};

async function catchResult(
  test: string,
  expected: string,
  fn: () => Promise<void> | void,
): Promise<HarnessResult> {
  try {
    await fn();
    return { test, passed: false, detail: "FAILED (No exception raised)" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const ok =
      (expected === "ValueError" && e instanceof Error && !(e instanceof InvariantViolation) && !(e instanceof DependencyError)) ||
      (expected === "InvariantViolation" && e instanceof InvariantViolation) ||
      (expected === "DependencyError" && e instanceof DependencyError) ||
      (expected === "Error" && e instanceof Error);
    return {
      test,
      passed: ok,
      detail: ok ? `PASSED (Caught: ${msg})` : `FAILED (Wrong exception: ${msg})`,
    };
  }
}

async function registerDummy(engine: EvidenceEngine) {
  const src = new Source("S-01", "document", "", "Custody trial");
  const art = new Artifact("Ar-01", "pdf", "hash");
  const acq = new AcquisitionEvent("Ac-01", UtcDateTime.now(), "direct");
  const asrt = new SourceAssertion("As-01", "S-01", "Ar-01", "quote");
  const interp = new AnalystInterpretation("In-01", "As-01", "An-01", "notes");
  await engine.addSource(src);
  await engine.addArtifact(art);
  await engine.addAcquisition(acq);
  await engine.addAssertion(asrt);
  await engine.addInterpretation(interp);
}

export async function runFailureTestHarness(): Promise<HarnessResult[]> {
  const results: HarnessResult[] = [];

  results.push(
    await catchResult("Inject 1: Empty content_hash rejection", "Error", () => {
      new Artifact("A-01", "pdf", "");
    }),
  );

  results.push(
    await catchResult("Inject 2: Non-existent evidence_id relationship rejection", "InvariantViolation", async () => {
      const engine = new EvidenceEngine("Run-Test");
      await engine.init();
      const prop = new Proposition(
        "P-01",
        "Asset LIB-923-1118 is authentic",
        PropositionType.FACTUAL,
      );
      await engine.addProposition(prop);
      const rel = new EvidenceRelationship("R-01", "E-NON-EXIST", "P-01", true);
      await engine.addRelationship(rel);
    }),
  );

  results.push(
    await catchResult("Inject 3: Circular dependency detection", "DependencyError", async () => {
      const engine = new EvidenceEngine("Run-Test");
      await engine.init();
      await registerDummy(engine);
      const v = definitiveVector();
      const e1 = new Evidence(
        "E-01",
        ["P-01"],
        "",
        EvidenceType.DOCUMENTARY,
        "S-01",
        "Ar-01",
        "Ac-01",
        "In-01",
        v,
        ["E-02"],
        DependencyType.DERIVED,
      );
      const e2 = new Evidence(
        "E-02",
        ["P-01"],
        "",
        EvidenceType.DOCUMENTARY,
        "S-01",
        "Ar-01",
        "Ac-01",
        "In-01",
        v,
        ["E-01"],
        DependencyType.DERIVED,
      );
      await engine.addEvidence(e1);
      await engine.addEvidence(e2);
      await engine.compileAndVerifyGraphs();
    }),
  );

  results.push(
    await catchResult("Inject 4: Factor status/strength mismatch rejection", "Error", () => {
      new FactorAssessment({ status: EpistemicStatus.UNKNOWN, strength: FactorStrength.STRONG });
    }),
  );

  results.push(
    await catchResult("Inject 5: Derived type missing dependencies rejection", "Error", async () => {
      const engine = new EvidenceEngine("Run-Test");
      await engine.init();
      await registerDummy(engine);
      const v = definitiveVector();
      new Evidence(
        "E-01",
        ["P-01"],
        "",
        EvidenceType.DOCUMENTARY,
        "S-01",
        "Ar-01",
        "Ac-01",
        "In-01",
        v,
        [],
        DependencyType.DERIVED,
      );
    }),
  );

  results.push(
    await catchResult("Inject 6: Empty provenance chain rejection", "Error", () => {
      new Source("S-01", "document", "description", "");
    }),
  );

  results.push(
    await catchResult("Inject 7: Naive datetime rejection", "Error", () => {
      new AcquisitionEvent("Ac-01", UtcDateTime.naiveNow(), "direct");
    }),
  );

  results.push(
    await catchResult("Inject 8: Empty proposition statement rejection", "Error", () => {
      new Proposition("P-01", "", PropositionType.FACTUAL);
    }),
  );

  return results;
}

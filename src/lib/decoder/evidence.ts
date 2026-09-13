import { canonicalJson, sha256Hex } from "./hash";

export const EpistemicStatus = {
  NOT_ASSESSED: "not_assessed",
  UNKNOWN: "unknown",
  ABSENT: "absent",
  PRESENT: "present",
  NOT_APPLICABLE: "not_applicable",
} as const;
export type EpistemicStatus = (typeof EpistemicStatus)[keyof typeof EpistemicStatus];

export const FactorStrength = {
  MINIMAL: 1,
  MODEST: 2,
  SUBSTANTIAL: 3,
  STRONG: 4,
  DEFINITIVE: 5,
} as const;
export type FactorStrength = (typeof FactorStrength)[keyof typeof FactorStrength];

export const EvidenceType = {
  DIRECT_OBSERVATION: "direct_observation",
  TESTIMONIAL: "testimonial",
  DOCUMENTARY: "documentary",
  DERIVED_COMPUTATION: "derived_computation",
  THIRD_PARTY_REPORT: "third_party_report",
} as const;
export type EvidenceType = (typeof EvidenceType)[keyof typeof EvidenceType];

export const PropositionType = {
  FACTUAL: "factual",
  CAUSAL: "causal",
  COUNTERFACTUAL: "counterfactual",
  NORMATIVE: "normative",
} as const;
export type PropositionType = (typeof PropositionType)[keyof typeof PropositionType];

export const ExecutionState = {
  UNDETERMINED: "undetermined",
  SUPPORTED: "supported",
  STRONGLY_SUPPORTED: "strongly_supported",
  CONTRADICTED: "contradicted",
  INSUFFICIENT_EVIDENCE: "insufficient_evidence",
  INVALID_EVIDENCE_MODEL: "invalid_evidence_model",
  CONFLICTING_EVIDENCE: "conflicting_evidence",
  NON_IDENTIFIABLE: "non_identifiable",
  UNSUPPORTED_EVALUATION: "unsupported_evaluation",
  EXECUTION_FAILURE: "execution_failure",
} as const;
export type ExecutionState = (typeof ExecutionState)[keyof typeof ExecutionState];

export const DependencyType = {
  INDEPENDENT: "independent",
  DERIVED: "derived",
  COMMON_SOURCE: "common_source",
} as const;
export type DependencyType = (typeof DependencyType)[keyof typeof DependencyType];

export class InvariantViolation extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvariantViolation";
  }
}

export class DependencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DependencyError";
  }
}

export type FactorDict = {
  status: EpistemicStatus;
  strength: number | null;
  basis: string;
};

export class FactorAssessment {
  readonly status: EpistemicStatus;
  readonly strength: FactorStrength | null;
  readonly basis: string;

  constructor(args: { status: EpistemicStatus; strength?: FactorStrength | null; basis?: string }) {
    this.status = args.status;
    this.strength = args.strength ?? null;
    this.basis = args.basis ?? "";
    if (this.status === EpistemicStatus.PRESENT && this.strength === null) {
      throw new Error("FactorAssessment: status=PRESENT requires strength to be specified.");
    }
    if (this.status !== EpistemicStatus.PRESENT && this.strength !== null) {
      throw new Error(`FactorAssessment: status=${this.status} cannot have strength.`);
    }
  }

  toDict(): FactorDict {
    return {
      status: this.status,
      strength: this.strength,
      basis: this.basis,
    };
  }
}

export class TenFactorVector {
  constructor(
    readonly provenance: FactorAssessment,
    readonly directness: FactorAssessment,
    readonly integrity: FactorAssessment,
    readonly reproducibility: FactorAssessment,
    readonly independence: FactorAssessment,
    readonly corroboration: FactorAssessment,
    readonly temporalProximity: FactorAssessment,
    readonly authenticity: FactorAssessment,
    readonly specificity: FactorAssessment,
    readonly motiveOpportunity: FactorAssessment,
  ) {}

  toDict(): Record<string, FactorDict> {
    return {
      P: this.provenance.toDict(),
      D: this.directness.toDict(),
      I: this.integrity.toDict(),
      R: this.reproducibility.toDict(),
      X: this.independence.toDict(),
      C: this.corroboration.toDict(),
      T: this.temporalProximity.toDict(),
      A: this.authenticity.toDict(),
      S: this.specificity.toDict(),
      M: this.motiveOpportunity.toDict(),
    };
  }
}

export function definitiveVector(basis = "test"): TenFactorVector {
  const f = (b: string) =>
    new FactorAssessment({
      status: EpistemicStatus.PRESENT,
      strength: FactorStrength.DEFINITIVE,
      basis: b,
    });
  return new TenFactorVector(f(basis), f(basis), f(basis), f(basis), f(basis), f(basis), f(basis), f(basis), f(basis), f(basis));
}

export class UtcDateTime {
  constructor(
    readonly date: Date,
    readonly tzAware: boolean,
  ) {}
  iso(): string {
    return this.date.toISOString();
  }
  static now(): UtcDateTime {
    return new UtcDateTime(new Date(), true);
  }
  static naiveNow(): UtcDateTime {
    return new UtcDateTime(new Date(), false);
  }
}

export class Source {
  constructor(
    readonly sourceId: string,
    readonly sourceType: string,
    readonly sourceDescription: string,
    readonly provenanceChain: string,
  ) {
    if (!this.sourceId || !this.provenanceChain) {
      throw new Error("Source: source_id and provenance_chain are REQUIRED.");
    }
  }
  async canonicalHash(): Promise<string> {
    return sha256Hex(
      canonicalJson({
        id: this.sourceId,
        type: this.sourceType,
        desc: this.sourceDescription,
        chain: this.provenanceChain,
      }),
    );
  }
}

export class Artifact {
  constructor(
    readonly artifactId: string,
    readonly artifactType: string,
    readonly contentHash: string,
    readonly contentHashAlgorithm = "SHA-256",
    readonly sizeBytes = 0,
    readonly integrityVerified = false,
    readonly integrityMethod = "",
    readonly integrityVerifierId = "",
  ) {
    if (!this.artifactId || !this.contentHash) {
      throw new Error("Artifact: artifact_id and content_hash are REQUIRED.");
    }
  }
  async canonicalHash(): Promise<string> {
    return sha256Hex(
      canonicalJson({
        id: this.artifactId,
        type: this.artifactType,
        hash: this.contentHash,
        alg: this.contentHashAlgorithm,
        size: this.sizeBytes,
        verified: this.integrityVerified,
        method: this.integrityMethod,
        verifier: this.integrityVerifierId,
      }),
    );
  }
}

export class AcquisitionEvent {
  constructor(
    readonly acquisitionId: string,
    readonly acquisitionDate: UtcDateTime,
    readonly acquisitionMethod: string,
    readonly acquisitionLocation: string | null = null,
    readonly acquiringAgent = "",
  ) {
    if (!(this.acquisitionDate instanceof UtcDateTime)) {
      throw new Error("AcquisitionEvent: acquisition_date must be datetime object.");
    }
    if (!this.acquisitionDate.tzAware) {
      throw new Error("AcquisitionEvent: acquisition_date must be timezone-aware (UTC).");
    }
  }
  async canonicalHash(): Promise<string> {
    return sha256Hex(
      canonicalJson({
        id: this.acquisitionId,
        date: this.acquisitionDate.iso(),
        method: this.acquisitionMethod,
        loc: this.acquisitionLocation,
        agent: this.acquiringAgent,
      }),
    );
  }
}

export class SourceAssertion {
  constructor(
    readonly assertionId: string,
    readonly sourceId: string,
    readonly artifactId: string,
    readonly quotedText: string,
    readonly context = "",
    readonly confidenceInTranscription = "verbatim",
  ) {
    if (!this.assertionId || !this.quotedText) {
      throw new Error("SourceAssertion: assertion_id and quoted_text are REQUIRED.");
    }
  }
  async canonicalHash(): Promise<string> {
    return sha256Hex(
      canonicalJson({
        id: this.assertionId,
        src: this.sourceId,
        art: this.artifactId,
        quote: this.quotedText,
        ctx: this.context,
        conf: this.confidenceInTranscription,
      }),
    );
  }
}

export class AnalystInterpretation {
  constructor(
    readonly interpretationId: string,
    readonly assertionId: string,
    readonly analystId: string,
    readonly analystNotes: string,
    readonly inferencesDrawn: string[] = [],
    readonly caveats: string[] = [],
  ) {
    if (!this.interpretationId || !this.analystNotes) {
      throw new Error("AnalystInterpretation: interpretation_id and analyst_notes are REQUIRED.");
    }
  }
  async canonicalHash(): Promise<string> {
    return sha256Hex(
      canonicalJson({
        id: this.interpretationId,
        assert: this.assertionId,
        analyst: this.analystId,
        notes: this.analystNotes,
        inf: this.inferencesDrawn,
        cav: this.caveats,
      }),
    );
  }
}

export class Evidence {
  constructor(
    readonly evidenceId: string,
    readonly propositionIds: string[],
    readonly statement: string,
    readonly evidenceType: EvidenceType,
    readonly sourceId: string,
    readonly artifactId: string,
    readonly acquisitionId: string,
    readonly interpretationId: string,
    readonly vector: TenFactorVector,
    readonly dependsOnEvidenceIds: string[] = [],
    readonly dependencyType: DependencyType = DependencyType.INDEPENDENT,
    readonly transformationDescription = "",
  ) {
    if (!this.sourceId || !this.artifactId) {
      throw new Error("Evidence Invariant: source_id and artifact_id are strictly REQUIRED.");
    }
    if (
      (this.dependencyType === DependencyType.DERIVED ||
        this.dependencyType === DependencyType.COMMON_SOURCE) &&
      this.dependsOnEvidenceIds.length === 0
    ) {
      throw new Error(
        `Evidence ${this.evidenceId}: dependency_type=${this.dependencyType} requires depends_on_evidence_ids.`,
      );
    }
  }
  async canonicalHash(): Promise<string> {
    return sha256Hex(
      canonicalJson({
        id: this.evidenceId,
        props: this.propositionIds,
        stmt: this.statement,
        type: this.evidenceType,
        src: this.sourceId,
        art: this.artifactId,
        acq: this.acquisitionId,
        interp: this.interpretationId,
        vec: this.vector.toDict(),
        deps: this.dependsOnEvidenceIds,
        dep_type: this.dependencyType,
        trans: this.transformationDescription,
      }),
    );
  }
}

export class Proposition {
  constructor(
    readonly propositionId: string,
    readonly statement: string,
    readonly propositionType: PropositionType,
    readonly requiredElements: string[] = [],
  ) {
    if (!this.statement || !this.statement.trim()) {
      throw new Error(`Proposition ${this.propositionId}: statement cannot be empty.`);
    }
  }
  async canonicalHash(): Promise<string> {
    return sha256Hex(
      canonicalJson({
        id: this.propositionId,
        stmt: this.statement,
        type: this.propositionType,
        req: this.requiredElements,
      }),
    );
  }
}

export class EvidenceRelationship {
  constructor(
    readonly relationshipId: string,
    readonly evidenceId: string,
    readonly propositionId: string,
    readonly supports: boolean,
    readonly basis = "",
  ) {}
  async canonicalHash(): Promise<string> {
    return sha256Hex(
      canonicalJson({
        id: this.relationshipId,
        ev: this.evidenceId,
        prop: this.propositionId,
        supports: this.supports,
        basis: this.basis,
      }),
    );
  }
}

export type AuditLogEntry = {
  sequenceNumber: number;
  timestamp: string;
  eventType: string;
  eventDescription: string;
  priorHash: string | null;
  eventData: Record<string, unknown>;
};

export type PropositionReceipt = {
  propositionId: string;
  statement: string;
  state: ExecutionState;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  timestamp: string;
};

export class EvidenceEngine {
  runId: string;
  specVersion: string;
  timestamp: Date;
  sources = new Map<string, Source>();
  artifacts = new Map<string, Artifact>();
  acquisitions = new Map<string, AcquisitionEvent>();
  assertions = new Map<string, SourceAssertion>();
  interpretations = new Map<string, AnalystInterpretation>();
  evidence = new Map<string, Evidence>();
  propositions = new Map<string, Proposition>();
  relationships: EvidenceRelationship[] = [];
  auditLog: AuditLogEntry[] = [];
  auditHashChain: string[] = [];

  constructor(runId: string, specVersion = "Build Readiness Package") {
    this.runId = runId;
    this.specVersion = specVersion;
    this.timestamp = new Date();
  }

  async init(): Promise<void> {
    await this.logEvent("ENGINE_INIT", "Deterministic Evidence Engine initialized successfully.");
  }

  private async logEvent(
    eventType: string,
    description: string,
    data: Record<string, unknown> = {},
  ): Promise<string> {
    const seq = this.auditLog.length;
    const prior = this.auditHashChain.at(-1) ?? null;
    const entry: AuditLogEntry = {
      sequenceNumber: seq,
      timestamp: new Date().toISOString(),
      eventType,
      eventDescription: description,
      priorHash: prior,
      eventData: data,
    };
    this.auditLog.push(entry);
    const payload = canonicalJson({
      sequence_number: entry.sequenceNumber,
      timestamp: entry.timestamp,
      event_type: entry.eventType,
      event_description: entry.eventDescription,
      prior_hash: entry.priorHash,
      event_data: entry.eventData,
    });
    const h = await sha256Hex(payload);
    this.auditHashChain.push(h);
    return h;
  }

  async addSource(s: Source) {
    this.sources.set(s.sourceId, s);
    await this.logEvent("ADD_SOURCE", `Source registered: ${s.sourceId}`, {
      hash: await s.canonicalHash(),
    });
  }
  async addArtifact(a: Artifact) {
    this.artifacts.set(a.artifactId, a);
    await this.logEvent("ADD_ARTIFACT", `Artifact registered: ${a.artifactId}`, {
      hash: await a.canonicalHash(),
    });
  }
  async addAcquisition(acq: AcquisitionEvent) {
    this.acquisitions.set(acq.acquisitionId, acq);
    await this.logEvent("ADD_ACQUISITION", `Acquisition event registered: ${acq.acquisitionId}`, {
      hash: await acq.canonicalHash(),
    });
  }
  async addAssertion(asrt: SourceAssertion) {
    if (!this.sources.has(asrt.sourceId)) {
      throw new InvariantViolation(
        `SourceAssertion ${asrt.assertionId}: Referenced source_id ${asrt.sourceId} does not exist.`,
      );
    }
    if (!this.artifacts.has(asrt.artifactId)) {
      throw new InvariantViolation(
        `SourceAssertion ${asrt.assertionId}: Referenced artifact_id ${asrt.artifactId} does not exist.`,
      );
    }
    this.assertions.set(asrt.assertionId, asrt);
    await this.logEvent("ADD_ASSERTION", `Source assertion registered: ${asrt.assertionId}`, {
      hash: await asrt.canonicalHash(),
    });
  }
  async addInterpretation(interp: AnalystInterpretation) {
    if (!this.assertions.has(interp.assertionId)) {
      throw new InvariantViolation(
        `AnalystInterpretation ${interp.interpretationId}: Referenced assertion_id ${interp.assertionId} does not exist.`,
      );
    }
    this.interpretations.set(interp.interpretationId, interp);
    await this.logEvent(
      "ADD_INTERPRETATION",
      `Analyst interpretation registered: ${interp.interpretationId}`,
      { hash: await interp.canonicalHash() },
    );
  }
  async addEvidence(ev: Evidence) {
    if (!this.sources.has(ev.sourceId)) {
      throw new InvariantViolation(
        `Evidence ${ev.evidenceId} error: source_id ${ev.sourceId} not registered.`,
      );
    }
    if (!this.artifacts.has(ev.artifactId)) {
      throw new InvariantViolation(
        `Evidence ${ev.evidenceId} error: artifact_id ${ev.artifactId} not registered.`,
      );
    }
    if (!this.acquisitions.has(ev.acquisitionId)) {
      throw new InvariantViolation(
        `Evidence ${ev.evidenceId} error: acquisition_id ${ev.acquisitionId} not registered.`,
      );
    }
    if (!this.interpretations.has(ev.interpretationId)) {
      throw new InvariantViolation(
        `Evidence ${ev.evidenceId} error: interpretation_id ${ev.interpretationId} not registered.`,
      );
    }
    this.evidence.set(ev.evidenceId, ev);
    await this.logEvent("ADD_EVIDENCE", `Evidence registered: ${ev.evidenceId}`, {
      hash: await ev.canonicalHash(),
    });
  }
  async addProposition(prop: Proposition) {
    this.propositions.set(prop.propositionId, prop);
    await this.logEvent("ADD_PROPOSITION", `Proposition registered: ${prop.propositionId}`, {
      hash: await prop.canonicalHash(),
    });
  }
  async addRelationship(rel: EvidenceRelationship) {
    if (!this.evidence.has(rel.evidenceId)) {
      throw new InvariantViolation(
        `EvidenceRelationship ${rel.relationshipId} error: evidence_id ${rel.evidenceId} not registered.`,
      );
    }
    if (!this.propositions.has(rel.propositionId)) {
      throw new InvariantViolation(
        `EvidenceRelationship ${rel.relationshipId} error: proposition_id ${rel.propositionId} not registered.`,
      );
    }
    this.relationships.push(rel);
    await this.logEvent(
      "ADD_RELATIONSHIP",
      `Relationship established: ${rel.evidenceId} -> ${rel.propositionId}`,
      { hash: await rel.canonicalHash() },
    );
  }

  async compileAndVerifyGraphs(): Promise<{ status: string; message: string }> {
    const visited = new Set<string>();
    const path = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      path.add(nodeId);
      const evNode = this.evidence.get(nodeId);
      if (evNode) {
        for (const parent of evNode.dependsOnEvidenceIds) {
          if (!visited.has(parent)) {
            if (dfs(parent)) return true;
          } else if (path.has(parent)) {
            return true;
          }
        }
      }
      path.delete(nodeId);
      return false;
    };

    for (const nodeId of this.evidence.keys()) {
      if (!visited.has(nodeId) && dfs(nodeId)) {
        throw new DependencyError(
          `Evidence Dependency Graph contains cycles starting from node: ${nodeId}`,
        );
      }
    }

    for (const rel of this.relationships) {
      if (!this.evidence.has(rel.evidenceId)) {
        throw new InvariantViolation(
          `EvidenceRelationship ${rel.relationshipId} error: evidence_id ${rel.evidenceId} not registered.`,
        );
      }
      if (!this.propositions.has(rel.propositionId)) {
        throw new InvariantViolation(
          `EvidenceRelationship ${rel.relationshipId} error: proposition_id ${rel.propositionId} not registered.`,
        );
      }
    }

    await this.logEvent(
      "GRAPH_VERIFIED",
      "Dependency and relationship graphs successfully compiled with no cycles.",
    );
    return { status: "SUCCESS", message: "All graphs compiled and verified with no cycles." };
  }

  async evaluateProposition(propositionId: string): Promise<PropositionReceipt> {
    const prop = this.propositions.get(propositionId);
    if (!prop) {
      throw new InvariantViolation(`Cannot evaluate non-existent proposition: ${propositionId}`);
    }
    const supporting: string[] = [];
    const contradicting: string[] = [];
    for (const rel of this.relationships) {
      if (rel.propositionId === propositionId) {
        if (rel.supports) supporting.push(rel.evidenceId);
        else contradicting.push(rel.evidenceId);
      }
    }

    let state: ExecutionState;
    if (contradicting.length > 0) {
      state = ExecutionState.CONTRADICTED;
    } else if (supporting.length > 0) {
      const roots = new Set<string>();
      const work = [...supporting];
      while (work.length) {
        const curr = work.pop()!;
        const currEv = this.evidence.get(curr);
        if (currEv && currEv.dependsOnEvidenceIds.length > 0) {
          for (const p of currEv.dependsOnEvidenceIds) work.push(p);
        } else {
          roots.add(curr);
        }
      }
      state = roots.size >= 3 ? ExecutionState.STRONGLY_SUPPORTED : ExecutionState.SUPPORTED;
    } else {
      state = ExecutionState.INSUFFICIENT_EVIDENCE;
    }

    const receipt: PropositionReceipt = {
      propositionId,
      statement: prop.statement,
      state,
      supportingEvidence: supporting,
      contradictingEvidence: contradicting,
      timestamp: new Date().toISOString(),
    };
    await this.logEvent("PROPOSITION_EVALUATED", `Evaluated ${propositionId} -> ${state}`, {
      ...receipt,
    });
    return receipt;
  }
}

export async function ingestGoldenCorpus(): Promise<{
  engine: EvidenceEngine;
  receipt: PropositionReceipt;
  graph: { status: string; message: string };
}> {
  const engine = new EvidenceEngine("SovereignOS-Run-01");
  await engine.init();

  const src = new Source(
    "S-REVERE-01",
    "document",
    "Revere foundry wastebook entries",
    "Massachusetts Historical Society Archive",
  );
  const art = new Artifact("AR-BOWL-01", "ledger_page", "e4f7a2b9c3d8e1f6a5b2c9d4");
  const acq = new AcquisitionEvent("ACQ-01", UtcDateTime.now(), "direct");
  const asrt = new SourceAssertion(
    "ASRT-01",
    "S-REVERE-01",
    "AR-BOWL-01",
    "Benjamin Green provided silver to make a Sugar Dish.",
  );
  const interp = new AnalystInterpretation(
    "INTRP-01",
    "ASRT-01",
    "AN-BASHAM",
    "Authenticates Revere's creation of BOWL-001 in 1762.",
  );

  await engine.addSource(src);
  await engine.addArtifact(art);
  await engine.addAcquisition(acq);
  await engine.addAssertion(asrt);
  await engine.addInterpretation(interp);

  const v = new TenFactorVector(
    new FactorAssessment({
      status: EpistemicStatus.PRESENT,
      strength: FactorStrength.DEFINITIVE,
      basis: "Housed at MHS",
    }),
    new FactorAssessment({
      status: EpistemicStatus.PRESENT,
      strength: FactorStrength.DEFINITIVE,
      basis: "Contemporaneous account",
    }),
    new FactorAssessment({
      status: EpistemicStatus.PRESENT,
      strength: FactorStrength.STRONG,
      basis: "No evidence of ledger modification",
    }),
    new FactorAssessment({
      status: EpistemicStatus.PRESENT,
      strength: FactorStrength.STRONG,
      basis: "Verifiable by independent historians",
    }),
    new FactorAssessment({
      status: EpistemicStatus.PRESENT,
      strength: FactorStrength.DEFINITIVE,
      basis: "Direct primary source",
    }),
    new FactorAssessment({
      status: EpistemicStatus.PRESENT,
      strength: FactorStrength.SUBSTANTIAL,
      basis: "Matches Boston custom house entries",
    }),
    new FactorAssessment({
      status: EpistemicStatus.PRESENT,
      strength: FactorStrength.DEFINITIVE,
      basis: "Written on August 27, 1762",
    }),
    new FactorAssessment({
      status: EpistemicStatus.PRESENT,
      strength: FactorStrength.DEFINITIVE,
      basis: "Handwriting authenticated as Revere's",
    }),
    new FactorAssessment({
      status: EpistemicStatus.PRESENT,
      strength: FactorStrength.SUBSTANTIAL,
      basis: "Detailed weight and name metadata provided",
    }),
    new FactorAssessment({
      status: EpistemicStatus.PRESENT,
      strength: FactorStrength.MODEST,
      basis: "Standard business ledger entry",
    }),
  );

  const ev = new Evidence(
    "E-REVERE-01",
    ["P-VESSEL-01"],
    "Paul Revere crafted the silver vessel in 1762",
    EvidenceType.DOCUMENTARY,
    "S-REVERE-01",
    "AR-BOWL-01",
    "ACQ-01",
    "INTRP-01",
    v,
  );
  await engine.addEvidence(ev);

  const prop = new Proposition(
    "P-VESSEL-01",
    "Asset BOWL-001 has verified Revere origin",
    PropositionType.FACTUAL,
  );
  await engine.addProposition(prop);

  const rel = new EvidenceRelationship(
    "REL-01",
    "E-REVERE-01",
    "P-VESSEL-01",
    true,
    "Direct matching ledger record",
  );
  await engine.addRelationship(rel);

  const graph = await engine.compileAndVerifyGraphs();
  const receipt = await engine.evaluateProposition("P-VESSEL-01");
  return { engine, receipt, graph };
}

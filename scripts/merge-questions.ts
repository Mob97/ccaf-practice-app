import fs from "fs";
import path from "path";

const CCAF_PATH = path.join(__dirname, "../question_sources/ccaf-questions.json");
const OFFICIAL_PATH = path.join(__dirname, "../question_sources/questions.json");
const PDF_PATH = path.join(__dirname, "../question_sources/pdf-extracted.json");
const OUTPUT_PATH = path.join(__dirname, "../src/data/question_bank.json");

// Domain mapping by numeric ID range
function getDomainInfo(numericId: number): { group: string; domain: string } {
  if (numericId <= 15) return { group: "research_pipeline", domain: "Agentic Architecture & Orchestration" };
  if (numericId <= 30) return { group: "code_exploration", domain: "Conversational AI & Context Management" };
  if (numericId <= 45) return { group: "customer_support", domain: "Customer Support Orchestration" };
  return { group: "extraction_pipeline", domain: "Structured Data Extraction" };
}

interface CcafOption {
  letter: string;
  text: string;
  correct: boolean;
  explain: string;
}

interface CcafQuestion {
  id: string;
  group: string;
  text: string;
  options: CcafOption[];
}

interface OfficialOption {
  label: string;
  text: string;
}

interface OfficialQuestion {
  id: number;
  domain: string;
  source: string;
  question: string;
  options: OfficialOption[];
}

interface PdfExtracted {
  id: string;
  correctLetter: string;
  pattern: string | null;
}

function main() {
  const ccafRaw: CcafQuestion[] = JSON.parse(fs.readFileSync(CCAF_PATH, "utf-8"));
  const officialRaw: OfficialQuestion[] = JSON.parse(fs.readFileSync(OFFICIAL_PATH, "utf-8"));

  let pdfRaw: PdfExtracted[] = [];
  if (fs.existsSync(PDF_PATH)) {
    pdfRaw = JSON.parse(fs.readFileSync(PDF_PATH, "utf-8"));
  } else {
    console.warn("⚠ pdf-extracted.json not found. Run parse-pdf.ts first. Patterns will be null.");
  }

  // Build lookup maps
  const officialByNumericId = new Map(officialRaw.map((q) => [q.id, q]));
  const pdfById = new Map(pdfRaw.map((q) => [q.id, q]));

  const sources = ["ccaf-questions", "officialPracticeTests", ...(pdfRaw.length > 0 ? ["main.pdf"] : [])];

  const questions = ccafRaw.map((ccaf, index) => {
    const numericId = index + 1;
    const qId = `Q${numericId}`;

    const official = officialByNumericId.get(numericId);
    const pdf = pdfById.get(qId);
    const domainInfo = getDomainInfo(numericId);

    // Merge options: use ccaf as base, add condensed text from official if available
    const options = ccaf.options.map((opt) => {
      const officialOpt = official?.options.find(
        (o) => o.label.toUpperCase() === opt.letter.toUpperCase()
      );
      return {
        letter: opt.letter.toUpperCase(),
        text: opt.text,
        correct: opt.correct,
        explain: opt.explain,
        condensedText: officialOpt?.text ?? null,
      };
    });

    // Override correct answer from PDF if ccaf is missing it
    let finalOptions = options;
    if (pdf?.correctLetter && !options.some((o) => o.correct)) {
      finalOptions = options.map((o) => ({
        ...o,
        correct: o.letter === pdf.correctLetter,
      }));
    }

    return {
      id: qId,
      numericId,
      group: ccaf.group ?? domainInfo.group,
      domain: official?.domain ?? domainInfo.domain,
      text: ccaf.text,
      condensedText: official?.question ?? null,
      options: finalOptions,
      pattern: pdf?.pattern ?? null,
      sources,
    };
  });

  // Assertions
  console.log("\n--- Validation ---");
  let errors = 0;

  if (questions.length !== 60) {
    console.error(`✗ Expected 60 questions, got ${questions.length}`);
    errors++;
  } else {
    console.log(`✓ 60 questions`);
  }

  const missingCorrect = questions.filter((q) => !q.options.some((o) => o.correct));
  if (missingCorrect.length > 0) {
    console.error(`✗ Questions missing correct answer: ${missingCorrect.map((q) => q.id).join(", ")}`);
    errors++;
  } else {
    console.log(`✓ All questions have a correct answer`);
  }

  const domainCounts = new Map<string, number>();
  questions.forEach((q) => {
    domainCounts.set(q.domain, (domainCounts.get(q.domain) ?? 0) + 1);
  });
  domainCounts.forEach((count, domain) => {
    if (count !== 15) {
      console.error(`✗ Domain "${domain}" has ${count} questions (expected 15)`);
      errors++;
    } else {
      console.log(`✓ Domain "${domain}": 15 questions`);
    }
  });

  const withPattern = questions.filter((q) => q.pattern).length;
  console.log(`  Patterns: ${withPattern}/60`);

  if (errors > 0) {
    console.error(`\n${errors} validation error(s). Aborting.`);
    process.exit(1);
  }

  const output = {
    meta: {
      version: "1.0.0",
      generated: new Date().toISOString(),
      total: questions.length,
      sources,
    },
    questions,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\n✓ Written to ${OUTPUT_PATH}`);
}

main();

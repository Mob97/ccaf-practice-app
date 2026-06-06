import fs from "fs";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require("pdf-parse") as {
  PDFParse: new (opts: { data: Buffer }) => { getText(): Promise<{ text: string }> };
};

const PDF_PATH = path.join(__dirname, "../question_sources/main.pdf");
const OUTPUT_PATH = path.join(__dirname, "../question_sources/pdf-extracted.json");

interface ExtractedQuestion {
  id: string;
  correctLetter: string;
  pattern: string | null;
}

async function main() {
  const buffer = fs.readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();

  // Filter out empty lines and page markers
  const lines = result.text
    .split("\n")
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 0 && !l.match(/^--\s*\d+\s+of\s+\d+\s*--$/));

  const extracted: ExtractedQuestion[] = [];

  let currentId: number | null = null;
  let correctLetter = "";
  let collectingPattern = false;
  let patternLines: string[] = [];
  let afterCorrectHeader = false;

  function pushCurrent() {
    if (currentId !== null) {
      extracted.push({
        id: `Q${currentId}`,
        correctLetter,
        pattern: patternLines.length > 0 ? patternLines.join(" ").trim() : null,
      });
    }
  }

  for (const line of lines) {
    // Detect question start: "Question N ..." but NOT TOC entries ("Question N — ...")
    const qMatch = line.match(/^Question\s+(\d+)(?!\s*[—–-])\s+\S/i);
    if (qMatch) {
      pushCurrent();
      currentId = parseInt(qMatch[1], 10);
      correctLetter = "";
      collectingPattern = false;
      patternLines = [];
      afterCorrectHeader = false;
      continue;
    }

    if (currentId === null) continue;

    // "Correct answer & why" header — next meaningful line has the letter
    if (/^Correct\s+answer\s*(&|and)\s*why$/i.test(line)) {
      afterCorrectHeader = true;
      continue;
    }

    // Letter line right after "Correct answer & why": "C — ..." or "C — ..."
    if (afterCorrectHeader) {
      const letterMatch = line.match(/^([A-D])\s*[—–\-]/i);
      if (letterMatch) {
        correctLetter = letterMatch[1].toUpperCase();
        afterCorrectHeader = false;
        continue;
      }
      // Sometimes it's on the same line as header
      afterCorrectHeader = false;
    }

    // "Pattern to memorise" section
    if (/^Pattern\s+to\s+memori[sz]e$/i.test(line)) {
      collectingPattern = true;
      patternLines = [];
      continue;
    }

    // Stop pattern collection at next section
    if (collectingPattern) {
      if (
        /^Question\s+\d+\b/i.test(line) ||
        /^Distractors$/i.test(line) ||
        /^Part\s+\d+/i.test(line) ||
        /^Master\s+answer/i.test(line)
      ) {
        collectingPattern = false;
        // Don't continue — fall through to check other patterns
      } else {
        // Skip header/footer lines that bleed into pattern
        if (
          !line.match(/^Claude\s+Certified/i) &&
          !line.match(/^\d+$/)
        ) {
          patternLines.push(line);
        }
        continue;
      }
    }
  }

  // Push last question
  pushCurrent();

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(extracted, null, 2));
  console.log(`Extracted ${extracted.length} questions → ${OUTPUT_PATH}`);

  const withPattern = extracted.filter((q) => q.pattern).length;
  const withAnswer = extracted.filter((q) => q.correctLetter).length;
  console.log(`  With correct answer: ${withAnswer}`);
  console.log(`  With pattern:        ${withPattern}`);
  if (extracted.length - withPattern > 0) {
    const missing = extracted.filter((q) => !q.pattern).map((q) => q.id);
    console.log(`  Missing pattern:     ${missing.join(", ")}`);
  }
  if (withAnswer < extracted.length) {
    const missing = extracted.filter((q) => !q.correctLetter).map((q) => q.id);
    console.log(`  Missing answer:      ${missing.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

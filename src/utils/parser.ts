import { Question, Option } from '../types';

export interface ParseResult {
  questions: Question[];
  errors: string[];
  warnings: string[];
  totalParsed: number;
}

export function parseRawMCQText(rawText: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const questions: Question[] = [];

  if (!rawText || !rawText.trim()) {
    return { questions: [], errors: ['No text provided'], warnings: [], totalParsed: 0 };
  }

  // Normalize line breaks
  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  interface RawQuestionBlock {
    qLines: string[];
    optionsMap: Record<string, string>;
    ansLine: string;
    expLine: string;
  }

  let currentBlock: RawQuestionBlock | null = null;
  const blocks: RawQuestionBlock[] = [];

  const isQuestionStart = (line: string): boolean => {
    const trimmed = line.trim();
    // Patterns like "1.", "1)", "Q1.", "Q1:", "Q.1", "Q 1.", "प्रश्न 1.", "प्रश्न 1:"
    return /^(\d+[\.\)]|(?:Q|q)(?:uestion)?\s*[\.\:\-]?\s*\d+[\.\:\-\)]?|प्रश्न\s*\d+[\.\:\-\)]?)\s+/i.test(trimmed);
  };

  const isOptionLine = (line: string): { isOption: boolean; label?: string; text?: string } => {
    const trimmed = line.trim();
    // Patterns like "A.", "A)", "(A)", "[A]", "a.", "a)", "A :", "A-"
    const match = trimmed.match(/^(\(?([A-Ea-e])[\.\)\:\-\]]?)\s+(.*)$/);
    if (match) {
      const label = match[2].toUpperCase();
      const text = match[3].trim();
      return { isOption: true, label, text };
    }
    return { isOption: false };
  };

  const isAnswerLine = (line: string): { isAnswer: boolean; answer?: string; rest?: string } => {
    const trimmed = line.trim();
    // Patterns like "Ans. B", "Ans: B", "Answer: B", "Ans - B", "उत्तर: B", "उत्तर - B", "Correct: B", "Ans B"
    // Also matches "Ans. B - Hadappa was found in 1921." or "Ans. B (Hadappa was found in 1921)"
    const match = trimmed.match(/^(?:ans(?:wer)?|उत्तर|correct|key)\s*[\.\:\-\=]?\s*\(?([A-Ea-e])\)?(?:\s*[\.\:\-\)]?)*(.*)$/i);
    if (match) {
      let rest = match[2] ? match[2].trim() : '';
      // Strip leading punctuation from rest (e.g. "- Hadappa was found..." or ": Hadappa...")
      rest = rest.replace(/^[\-\:\.\,\(\)]+\s*/, '').replace(/\)$/, '').trim();
      return { isAnswer: true, answer: match[1].toUpperCase(), rest };
    }
    return { isAnswer: false };
  };

  const isExplanationLine = (line: string): { isExp: boolean; text?: string } => {
    const trimmed = line.trim();
    // Patterns like "Exp:", "Explanation:", "व्याख्या:", "हल:", "Note:", "1-liner:"
    const match = trimmed.match(/^(?:exp(?:lanation)?|व्याख्या|हल|note|detail|1-liner|liner)\s*[\.\:\-]\s*(.*)$/i);
    if (match) {
      return { isExp: true, text: match[1].trim() };
    }
    return { isExp: false };
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      continue;
    }

    if (isQuestionStart(trimmed)) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        qLines: [trimmed],
        optionsMap: {},
        ansLine: '',
        expLine: '',
      };
      continue;
    }

    const optCheck = isOptionLine(trimmed);
    if (optCheck.isOption && optCheck.label && currentBlock) {
      currentBlock.optionsMap[optCheck.label] = optCheck.text || '';
      continue;
    }

    const ansCheck = isAnswerLine(trimmed);
    if (ansCheck.isAnswer && ansCheck.answer && currentBlock) {
      currentBlock.ansLine = ansCheck.answer;
      if (ansCheck.rest && !currentBlock.expLine) {
        currentBlock.expLine = ansCheck.rest;
      }
      continue;
    }

    const expCheck = isExplanationLine(trimmed);
    if (expCheck.isExp && currentBlock) {
      currentBlock.expLine = (currentBlock.expLine ? currentBlock.expLine + ' ' : '') + (expCheck.text || '');
      continue;
    }

    // Otherwise, append to question lines or explanation if already in block
    if (currentBlock) {
      if (Object.keys(currentBlock.optionsMap).length === 0) {
        // Still part of question title
        currentBlock.qLines.push(trimmed);
      } else if (currentBlock.ansLine) {
        // After answer, part of explanation
        currentBlock.expLine = (currentBlock.expLine ? currentBlock.expLine + ' ' : '') + trimmed;
      } else {
        // Could be continuing an option
        const lastOptKey = ['E', 'D', 'C', 'B', 'A'].find(k => k in currentBlock!.optionsMap);
        if (lastOptKey) {
          currentBlock.optionsMap[lastOptKey] += ' ' + trimmed;
        } else {
          currentBlock.qLines.push(trimmed);
        }
      }
    } else {
      // If there wasn't a question number yet, start a block
      currentBlock = {
        qLines: [trimmed],
        optionsMap: {},
        ansLine: '',
        expLine: '',
      };
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  // Now convert blocks to Question objects
  blocks.forEach((b, idx) => {
    // Clean up question text
    let qText = b.qLines.join(' ').trim();
    // Strip leading number if present for a cleaner display, but keep original if needed
    qText = qText.replace(/^(\d+[\.\)]|(?:Q|q)(?:uestion)?\s*[\.\:\-]?\s*\d+[\.\:\-\)]?|प्रश्न\s*\d+[\.\:\-\)]?)\s*/i, '').trim();

    const options: Option[] = [];
    const labels = ['A', 'B', 'C', 'D', 'E'];
    labels.forEach(lbl => {
      if (b.optionsMap[lbl] !== undefined) {
        options.push({
          label: lbl,
          text: b.optionsMap[lbl].trim(),
        });
      }
    });

    // Determine correct answer
    let ans = b.ansLine;
    if (!ans) {
      // Default to 'A' with a warning if missing
      ans = options.length > 0 ? options[0].label : 'A';
      warnings.push(`प्रश्न #${idx + 1} ("${qText.substring(0, 30)}...") का उत्तर नहीं मिला। डिफ़ॉल्ट 'A' सेट किया गया।`);
    }

    if (options.length < 2) {
      errors.push(`प्रश्न #${idx + 1} ("${qText.substring(0, 30)}...") में कम से कम 2 विकल्प (A, B) होने चाहिए।`);
    }

    questions.push({
      id: `q_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      number: idx + 1,
      questionText: qText || `Question ${idx + 1}`,
      options,
      correctAnswer: ans,
      explanation: b.expLine.trim() || undefined,
    });
  });

  return {
    questions,
    errors,
    warnings,
    totalParsed: questions.length,
  };
}

export function formatQuestionsToRaw(questions: Question[]): string {
  return questions
    .map((q, idx) => {
      let text = `${idx + 1}. ${q.questionText}\n`;
      q.options.forEach(opt => {
        text += `${opt.label}. ${opt.text}\n`;
      });
      text += `Ans. ${q.correctAnswer}\n`;
      if (q.explanation) {
        text += `Exp: ${q.explanation}\n`;
      }
      return text;
    })
    .join('\n');
}

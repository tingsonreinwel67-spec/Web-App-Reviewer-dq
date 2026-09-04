export type SplitQuestion = {
  prompt: string;
  statements: string[];
};

/**
 * Splits a question from any roman-numeral statements it enumerates, so the
 * two can be rendered apart instead of running together as one paragraph.
 *
 * Shared by the flashcard and memorization screens so both read the same way.
 */
export function splitStatements(text: string): SplitQuestion {
  const matches = [...text.matchAll(/(?:^|\s)([IVXLCDM]+\.)\s*/g)];
  if (!matches.length) return { prompt: text.trim(), statements: [] };

  const starts = matches.map(
    (match) => (match.index ?? 0) + match[0].indexOf(match[1]),
  );

  return {
    prompt: text.slice(0, starts[0]).trim(),
    statements: starts.map((start, index) =>
      text.slice(start, starts[index + 1]).trim(),
    ),
  };
}

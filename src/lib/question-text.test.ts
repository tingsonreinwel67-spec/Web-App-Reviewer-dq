import { describe, expect, it } from "vitest";
import { splitStatements } from "./question-text";

describe("splitStatements", () => {
  it("separates a prompt from its roman-numeral statements", () => {
    const result = splitStatements(
      "Which of the following describe the differences? I. Variable life products allow policyholders to vary the premium payments. II. Variable life products can take the form of whole life. III. Variable life products allow single premiums.",
    );

    expect(result.prompt).toBe(
      "Which of the following describe the differences?",
    );
    expect(result.statements).toEqual([
      "I. Variable life products allow policyholders to vary the premium payments.",
      "II. Variable life products can take the form of whole life.",
      "III. Variable life products allow single premiums.",
    ]);
  });

  it("returns the whole text as the prompt when there are no statements", () => {
    const text = "What is the primary purpose of a beneficiary designation?";
    expect(splitStatements(text)).toEqual({ prompt: text, statements: [] });
  });

  it("handles a single statement", () => {
    const result = splitStatements("Consider the following. I. Only this one.");
    expect(result.prompt).toBe("Consider the following.");
    expect(result.statements).toEqual(["I. Only this one."]);
  });

  it("keeps text that merely contains roman letters intact", () => {
    const text = "Variable life policies invest in separate accounts.";
    expect(splitStatements(text).statements).toEqual([]);
  });

  it("trims surrounding whitespace", () => {
    const result = splitStatements("  Prompt here.   I. First.   II. Second.  ");
    expect(result.prompt).toBe("Prompt here.");
    expect(result.statements).toEqual(["I. First.", "II. Second."]);
  });

  it("treats text that opens with a statement as having no prompt", () => {
    const result = splitStatements("I. First point. II. Second point.");
    expect(result.prompt).toBe("");
    expect(result.statements).toEqual(["I. First point.", "II. Second point."]);
  });
});

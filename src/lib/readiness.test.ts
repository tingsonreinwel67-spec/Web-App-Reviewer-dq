import { describe, expect, it } from "vitest";
import { readinessStatus, statusLabels } from "./readiness";

describe("readinessStatus", () => {
  it("marks 90 and above as exam ready", () => {
    expect(readinessStatus(90)).toBe("EXAM_READY");
    expect(readinessStatus(100)).toBe("EXAM_READY");
  });

  it("marks the band from 70 to 89 as on track", () => {
    expect(readinessStatus(70)).toBe("ON_TRACK");
    expect(readinessStatus(89)).toBe("ON_TRACK");
  });

  it("marks below 70 as at risk", () => {
    expect(readinessStatus(69)).toBe("AT_RISK");
    expect(readinessStatus(0)).toBe("AT_RISK");
  });

  it("has a label for every status it can return", () => {
    for (const score of [0, 69, 70, 89, 90, 100]) {
      expect(statusLabels[readinessStatus(score)]).toBeTruthy();
    }
  });
});

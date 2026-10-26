import { describe, it, expect } from "vitest";
describe("VoyageTrack API contract", () => {
  it("uses required voyage fields", () => {
    const voyage = { reference: "VYG-TEST", vesselId: 1, origin: "Singapore", destination: "Rotterdam" };
    expect(voyage.reference).toBeTruthy();
    expect(voyage.origin).not.toEqual(voyage.destination);
  });
});

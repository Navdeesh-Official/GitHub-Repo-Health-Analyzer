import { test, expect } from "bun:test";
import { calculateHealthScore } from "./scoring";
import { RepoDetails } from "../types";

const mockRepo: RepoDetails = {
    owner: "test-owner",
    name: "test-repo",
    description: "A test repository",
    stars: 100,
    forks: 50,
    openIssues: 10,
    watchers: 100,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    lastCommitDate: new Date().toISOString(),
    hasWiki: true,
    hasPages: false,
    license: {
        name: "MIT License",
        key: "mit",
        url: "https://api.github.com/licenses/mit"
    },
    defaultBranch: "main"
};

test("calculateHealthScore handles missing README correctly", () => {
    const contributorsCount = 5;
    const files = ["LICENSE", "index.ts"];
    const readmeContent = null;

    const result = calculateHealthScore(
        mockRepo,
        contributorsCount,
        files,
        readmeContent
    );

    // Verify fileChecks
    expect(result.fileChecks.hasReadme).toBe(false);
    expect(result.fileChecks.readmeSize).toBe(0);

    // Verify breakdown contains missing README message
    expect(result.breakdown).toContain("Missing README.md (-30 pts)");

    // Verify documentation subscore
    // With license (10 pts) but no README (0 pts), subscore should be 10
    expect(result.subScores.documentation).toBe(10);

    // Verify that "Poor documentation quality" is NOT added if score is 10
    expect(result.breakdown).not.toContain("Poor documentation quality");
});

test("calculateHealthScore handles missing README and missing License", () => {
    const repoNoLicense = { ...mockRepo, license: null };
    const contributorsCount = 5;
    const files = ["index.ts"];
    const readmeContent = null;

    const result = calculateHealthScore(
        repoNoLicense,
        contributorsCount,
        files,
        readmeContent
    );

    expect(result.fileChecks.hasReadme).toBe(false);
    expect(result.fileChecks.hasLicense).toBe(false);
    expect(result.subScores.documentation).toBe(0);

    expect(result.breakdown).toContain("Missing README.md (-30 pts)");
    expect(result.breakdown).toContain("Missing License file");
    expect(result.breakdown).toContain("Poor documentation quality");
});

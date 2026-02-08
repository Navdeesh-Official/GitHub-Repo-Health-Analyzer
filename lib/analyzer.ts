import { fetchRepoDetails, fetchContributors, fetchReadme, checkFiles } from "@/lib/github";
import { calculateHealthScore } from "@/lib/scoring";
import { RepoAnalysis } from "@/types";

export async function analyzeRepo(repoUrl: string): Promise<RepoAnalysis> {
    if (!repoUrl || typeof repoUrl !== "string") {
        throw new Error("Invalid Repository URL");
    }

    // Extract owner/name
    // Supports: https://github.com/owner/name, github.com/owner/name, owner/name
    let owner = "", name = "";
    const cleanUrl = repoUrl.trim().replace(/^https?:\/\/(www\.)?github\.com\//, "");
    const parts = cleanUrl.split("/");
    if (parts.length >= 2) {
        owner = parts[0];
        name = parts[1];
    } else {
        throw new Error("Invalid URL format. Expected github.com/owner/repo");
    }

    // Validate owner and name to prevent path traversal and other injection attacks
    // GitHub username rules: Alphanumeric and hyphens, max 39 chars, no consecutive hyphens, cannot start/end with hyphen
    const ownerRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
    // GitHub repo rules: Alphanumeric, hyphens, underscores, and periods, max 100 chars
    const nameRegex = /^[a-z\d._-]{1,100}$/i;

    if (!ownerRegex.test(owner)) {
        throw new Error("Invalid repository owner");
    }
    if (!nameRegex.test(name)) {
        throw new Error("Invalid repository name");
    }

    try {
        const details = await fetchRepoDetails(owner, name);

        const [readme, contributors, fileList] = await Promise.all([
            fetchReadme(owner, name),
            fetchContributors(owner, name),
            checkFiles(owner, name, details.defaultBranch)
        ]);

        const analysis = calculateHealthScore(details, contributors.length, fileList, readme);

        return {
            url: `https://github.com/${owner}/${name}`,
            details,
            contributorsCount: contributors.length,
            ...analysis
        };
    } catch (error: any) {
        console.error(error);
        throw new Error(error.message || "Failed to analyze repository");
    }
}

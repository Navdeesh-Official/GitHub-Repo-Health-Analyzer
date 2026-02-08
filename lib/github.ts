import { RepoDetails, Contributor, RepoContent, GitHubTreeResponse } from "@/types";

const GITHUB_API_BASE = "https://api.github.com";

export async function fetchRepoDetails(owner: string, name: string): Promise<RepoDetails> {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${name}`);

    if (!res.ok) {
        if (res.status === 404) throw new Error("Repository not found (or private).");
        if (res.status === 403) throw new Error("API rate limit exceeded.");
        throw new Error(`GitHub API error: ${res.statusText}`);
    }

    const data = await res.json();

    // Fetch last commit date separately as updatedAt refers to meta updates
    const lastCommitRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${name}/commits?per_page=1`);
    let lastCommitDate = data.updated_at;
    if (lastCommitRes.ok) {
        const commitData = await lastCommitRes.json();
        if (commitData.length > 0) {
            lastCommitDate = commitData[0].commit.committer.date;
        }
    }

    return {
        owner: data.owner.login,
        name: data.name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        watchers: data.watchers_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        lastCommitDate: lastCommitDate,
        hasWiki: data.has_wiki,
        hasPages: data.has_pages,
        license: data.license
            ? {
                name: data.license.name,
                key: data.license.key,
                url: data.license.url,
            }
            : null,
        defaultBranch: data.default_branch,
    };
}

export async function fetchContributors(owner: string, name: string): Promise<Contributor[]> {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${name}/contributors?per_page=30`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((c: any) => ({
        login: c.login,
        contributions: c.contributions,
        avatarUrl: c.avatar_url,
    }));
}

export async function checkFiles(owner: string, name: string, branch: string): Promise<string[]> {
    // List root files to check for specific files like CONTRIBUTING.md, CODE_OF_CONDUCT.md
    const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${name}/git/trees/${branch}?recursive=0`);
    if (!res.ok) return [];
    const data = await res.json() as GitHubTreeResponse;
    return data.tree.map((f) => f.path);
}

export async function fetchReadme(owner: string, name: string): Promise<string | null> {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${name}/readme`, {
        headers: { 'Accept': 'application/vnd.github.raw' },
    });
    if (!res.ok) return null;
    return await res.text();
}

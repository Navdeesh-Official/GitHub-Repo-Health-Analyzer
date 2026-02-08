import { RepoDetails, Contributor } from "@/types";

const GITHUB_API_BASE = process.env.NEXT_PUBLIC_GITHUB_API_BASE || "https://api.github.com";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);
    if (process.env.GITHUB_TOKEN) {
        headers.set("Authorization", `Bearer ${process.env.GITHUB_TOKEN}`);
    }
    headers.set("Accept", "application/vnd.github.v3+json");

    const res = await fetch(url, { ...options, headers });
    return res;
}

export async function fetchRepoDetails(owner: string, name: string): Promise<RepoDetails> {
    const repoPromise = fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${name}`);
    const lastCommitPromise = fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${name}/commits?per_page=1`);

    const [res, lastCommitRes] = await Promise.all([repoPromise, lastCommitPromise]);

    if (!res.ok) {
        if (res.status === 404) throw new Error("Repository not found (or private).");
        if (res.status === 403) throw new Error("API rate limit exceeded.");
        throw new Error(`GitHub API error: ${res.statusText}`);
    }

    const data = await res.json();

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
        topics: data.topics || [],
    };
}

interface GitHubContributor {
    login: string;
    contributions: number;
    avatar_url: string;
}

export async function fetchContributors(owner: string, name: string): Promise<Contributor[]> {
    const res = await fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${name}/contributors?per_page=30`);
    if (!res.ok) return [];
    const data = await res.json() as GitHubContributor[];
    return data.map((c) => ({
        login: c.login,
        contributions: c.contributions,
        avatarUrl: c.avatar_url,
    }));
}

interface GitHubTreeItem {
    path: string;
    mode: string;
    type: string;
    sha: string;
    size?: number;
    url: string;
}

interface GitHubTreeResponse {
    sha: string;
    url: string;
    tree: GitHubTreeItem[];
    truncated: boolean;
}

export async function checkFiles(owner: string, name: string, branch: string): Promise<string[]> {
    const res = await fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${name}/git/trees/${branch}?recursive=0`);
    if (!res.ok) return [];
    const data = await res.json() as GitHubTreeResponse;
    return data.tree.map((f) => f.path);
}

export async function fetchReadme(owner: string, name: string): Promise<string | null> {
    const res = await fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${name}/readme`, {
        headers: { 'Accept': 'application/vnd.github.raw' },
    });
    if (!res.ok) return null;
    return await res.text();
}

export async function fetchCommitActivity(owner: string, name: string): Promise<number[]> {
    const res = await fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${name}/stats/participation`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.all || []; // Array of last 52 weeks
}

export async function fetchLanguages(owner: string, name: string): Promise<Record<string, number>> {
    const res = await fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${name}/languages`);
    if (!res.ok) return {};
    return await res.json();
}

export async function fetchCommunityProfile(owner: string, name: string): Promise<unknown> {
    const res = await fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${name}/community/profile`);
    if (!res.ok) return null;
    return await res.json();
}

export async function fetchFileContent(owner: string, name: string, path: string): Promise<string | null> {
    const res = await fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${name}/contents/${path}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.content && data.encoding === 'base64') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return null;
}

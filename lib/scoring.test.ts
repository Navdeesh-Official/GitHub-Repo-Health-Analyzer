import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateHealthScore } from './scoring';
import { RepoDetails } from '../types';

describe('calculateHealthScore', () => {
    // Mock current date to 2024-01-01
    const MOCK_NOW = new Date('2024-01-01T00:00:00Z');

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(MOCK_NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // Helper to create a partial RepoDetails
    const createRepo = (overrides: Partial<RepoDetails> = {}): RepoDetails => ({
        owner: 'owner',
        name: 'repo',
        description: 'desc',
        stars: 100,
        forks: 10,
        openIssues: 5,
        watchers: 5,
        createdAt: '2020-01-01T00:00:00Z',
        updatedAt: '2023-12-31T00:00:00Z',
        lastCommitDate: '2023-12-31T00:00:00Z',
        hasWiki: true,
        hasPages: false,
        license: { name: 'MIT', key: 'mit', url: 'http://license' },
        defaultBranch: 'main',
        ...overrides,
    });

    describe('Maintenance Activity Score', () => {
        it('should give 30 points for repos active within the last 7 days', () => {
            // 2 days ago
            const lastCommit = new Date(MOCK_NOW);
            lastCommit.setDate(lastCommit.getDate() - 2);

            const repo = createRepo({ lastCommitDate: lastCommit.toISOString() });
            const result = calculateHealthScore(repo, 10, [], 'README');

            expect(result.subScores.maintenance).toBe(30);
            expect(result.breakdown).not.toContain("Repository seems inactive (> 1 year without commits)");
        });

        it('should give 20 points for repos active within the last 30 days', () => {
            // 15 days ago
            const lastCommit = new Date(MOCK_NOW);
            lastCommit.setDate(lastCommit.getDate() - 15);

            const repo = createRepo({ lastCommitDate: lastCommit.toISOString() });
            const result = calculateHealthScore(repo, 10, [], 'README');

            expect(result.subScores.maintenance).toBe(20);
        });

        it('should give 10 points for repos active within the last 90 days', () => {
            // 45 days ago
            const lastCommit = new Date(MOCK_NOW);
            lastCommit.setDate(lastCommit.getDate() - 45);

            const repo = createRepo({ lastCommitDate: lastCommit.toISOString() });
            const result = calculateHealthScore(repo, 10, [], 'README');

            expect(result.subScores.maintenance).toBe(10);
        });

        it('should give 5 points for repos active within the last year', () => {
            // 200 days ago
            const lastCommit = new Date(MOCK_NOW);
            lastCommit.setDate(lastCommit.getDate() - 200);

            const repo = createRepo({ lastCommitDate: lastCommit.toISOString() });
            const result = calculateHealthScore(repo, 10, [], 'README');

            expect(result.subScores.maintenance).toBe(5);
        });

        it('should give 0 points and a breakdown message for inactive repos (> 1 year)', () => {
            // 400 days ago
            const lastCommit = new Date(MOCK_NOW);
            lastCommit.setDate(lastCommit.getDate() - 400);

            const repo = createRepo({ lastCommitDate: lastCommit.toISOString() });
            const result = calculateHealthScore(repo, 10, [], 'README');

            expect(result.subScores.maintenance).toBe(0);
            expect(result.breakdown).toContain("Repository seems inactive (> 1 year without commits)");
        });
    });
});

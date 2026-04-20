import { describe, it, expect } from 'vitest';
import {
    mockDeduplicationRules,
    mockSuppressionRules,
    mockCorrelationRules,
    mockClusters
} from './mockData';

describe('Mock Data Integrity', () => {
    it('should have valid deduplication rules', () => {
        expect(Array.isArray(mockDeduplicationRules)).toBe(true);
        mockDeduplicationRules.forEach(rule => {
            expect(rule).toHaveProperty('id');
            expect(rule).toHaveProperty('name');
            expect(rule).toHaveProperty('status');
            expect(rule).toHaveProperty('type');
        });
    });

    it('should have valid suppression rules', () => {
        expect(Array.isArray(mockSuppressionRules)).toBe(true);
        mockSuppressionRules.forEach(rule => {
            expect(rule).toHaveProperty('id');
            expect(rule).toHaveProperty('name');
            expect(rule).toHaveProperty('status');
            expect(rule).toHaveProperty('type');
        });
    });

    it('should have valid correlation rules', () => {
        expect(Array.isArray(mockCorrelationRules)).toBe(true);
        mockCorrelationRules.forEach(rule => {
            expect(rule).toHaveProperty('id');
            expect(rule).toHaveProperty('name');
            expect(rule).toHaveProperty('status');
            expect(rule).toHaveProperty('type');
        });
    });

    it('should have valid clusters', () => {
        expect(Array.isArray(mockClusters)).toBe(true);
        mockClusters.forEach(cluster => {
            expect(cluster).toHaveProperty('id');
            expect(cluster).toHaveProperty('rootEvent');
            expect(cluster).toHaveProperty('childEvents');
            expect(cluster.childEvents).toBeInstanceOf(Array);
            expect(cluster).toHaveProperty('status');
        });
    });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RulesSection } from './RulesSection';
import { mockSuppressionRules, mockDeduplicationRules, mockCorrelationRules } from '@/data/mock/mockData';

// Mock the Lucide icons since they are used heavily and might affect snapshots/searching
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual as any,
        // Add specific icon mocks if needed, otherwise use the actual ones or simple svgs
    };
});

describe('RulesSection Component', () => {
    it('renders the suppression section', () => {
        render(<RulesSection section="Suppression" />);
        // Header specific to suppression
        expect(screen.getByText(/Suppression Rules/i)).toBeInTheDocument();
    });

    it('displays mock suppression rules', async () => {
        render(<RulesSection section="Suppression" />);
        // Check if the rules from mockData are rendered
        mockSuppressionRules.forEach(rule => {
            expect(screen.getByText(rule.name)).toBeInTheDocument();
        });
    });

    it('renders the deduplication section', () => {
        render(<RulesSection section="Deduplication" />);
        expect(screen.getByText(/Deduplication Rules/i)).toBeInTheDocument();
        
        mockDeduplicationRules.forEach(rule => {
            expect(screen.getByText(rule.name)).toBeInTheDocument();
        });
    });

    it('renders the correlation section', () => {
        render(<RulesSection section="CorrelationTypes" />);
        expect(screen.getByText(/Correlation/i)).toBeInTheDocument();
        
        mockCorrelationRules.forEach(rule => {
            expect(screen.getByText(rule.name)).toBeInTheDocument();
        });
    });

    it('filters rules by search query', async () => {
        render(<RulesSection section="Suppression" />);
        const searchInput = screen.getByPlaceholderText(/search rules/i);

        // Type a specific rule name (assuming one exists)
        // Let's use the first suppression rule name
        const targetRule = mockSuppressionRules[0];
        fireEvent.change(searchInput, { target: { value: targetRule.name } });

        // Expect the target rule to be visible
        expect(screen.getByText(targetRule.name)).toBeInTheDocument();

        // Expect other rules to be filtered out (if names are distinct)
        // This is a basic check; stricter verification could check for non-existence of other rule names
    });

    it('handles empty data gracefully (simulated via empty filter result)', async () => {
        render(<RulesSection section="Suppression" />);
        const searchInput = screen.getByPlaceholderText(/search rules/i);

        // Search for something that definitely doesn't exist
        fireEvent.change(searchInput, { target: { value: 'NON_EXISTENT_RULE_XYZ_123' } });

        expect(screen.getByText('No rules found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
    });

    it('renders "Add Rule" button', () => {
        render(<RulesSection section="Suppression" />);
        const addButtons = screen.getAllByText('Add Rule');
        expect(addButtons.length).toBeGreaterThan(0);
    });
});

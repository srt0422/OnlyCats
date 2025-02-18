import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Home Page', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state initially', () => {
    render(<Home />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays cat images after loading', async () => {
    render(<Home />);
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2); // We expect 2 cat images for voting
    });
  });

  it('displays error message when data fetching fails', async () => {
    // Mock fetch to fail
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));
    
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('allows voting for a cat', async () => {
    render(<Home />);
    await waitFor(() => {
      const voteButtons = screen.getAllByRole('button', { name: /vote/i });
      expect(voteButtons).toHaveLength(2);
      
      fireEvent.click(voteButtons[0]);
      expect(mockRouter.push).toHaveBeenCalled();
    });
  });

  it('displays cat metadata correctly', async () => {
    render(<Home />);
    await waitFor(() => {
      const catIds = screen.getAllByTestId('cat-id');
      const generatedDates = screen.getAllByTestId('generated-date');
      
      expect(catIds).toHaveLength(2);
      expect(generatedDates).toHaveLength(2);
    });
  });

  it('has responsive layout', async () => {
    const { container } = render(<Home />);
    await waitFor(() => {
      const mainContainer = container.querySelector('main');
      expect(mainContainer).toHaveClass('container', 'mx-auto', 'px-4');
    });
  });
}); 
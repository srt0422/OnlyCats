import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('Home Page', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockCats = [
    {
      id: '1',
      imageUrl: '/test_cat-1.jpg',
      votes: 5,
      generatedAt: new Date().toISOString(),
      description: 'Test Cat 1'
    },
    {
      id: '2',
      imageUrl: '/test_cat-2.jpg',
      votes: 3,
      generatedAt: new Date().toISOString(),
      description: 'Test Cat 2'
    }
  ];

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    // Reset fetch mock
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<Home />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays cat images after loading', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCats)
      })
    );

    render(<Home />);
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2); // We expect 2 cat images for voting
    });
  });

  it('displays error message when data fetching fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('allows voting for a cat', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCats)
      })
    );

    render(<Home />);
    await waitFor(() => {
      const voteButtons = screen.getAllByRole('button', { name: /vote/i });
      expect(voteButtons).toHaveLength(2);
      
      fireEvent.click(voteButtons[0]);
      expect(mockRouter.push).toHaveBeenCalled();
    });
  });

  it('displays cat metadata correctly', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCats)
      })
    );

    render(<Home />);
    await waitFor(() => {
      const catIds = screen.getAllByTestId('cat-id');
      const generatedDates = screen.getAllByTestId('generated-date');
      
      expect(catIds).toHaveLength(2);
      expect(generatedDates).toHaveLength(2);
    });
  });

  it('has responsive layout', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCats)
      })
    );

    const { container } = render(<Home />);
    await waitFor(() => {
      const mainContainer = container.querySelector('main');
      expect(mainContainer).toHaveClass('container', 'mx-auto', 'px-4');
    });
  });
}); 
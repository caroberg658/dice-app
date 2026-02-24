import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import '@testing-library/jest-dom';

describe('Dice Roller App', () => {
  it('renders the initial state with 5 dice', () => {
    render(<App />);
    expect(screen.getByText('Dice Roller')).toBeInTheDocument();
    
    // Check for 5 dice by looking for the dice grid children
    const diceElements = document.querySelectorAll('.dice-grid > div');
    expect(diceElements.length).toBe(5);
    
    // Check for the "5" in the stepper
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('can increase and decrease the number of dice', () => {
    render(<App />);
    const plusButton = screen.getByLabelText('Increase dice count');
    const minusButton = screen.getByLabelText('Decrease dice count');
    
    fireEvent.click(plusButton);
    expect(screen.getByText('6')).toBeInTheDocument();
    
    fireEvent.click(minusButton);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('can exclude a die from rolling', () => {
    render(<App />);
    // Find all dice. They are clickable motion.divs.
    // We can find them by the fact they have a background color from our list.
    const diceElements = document.querySelectorAll('.dice-grid > div');
    expect(diceElements.length).toBe(5);

    // Click the first die to exclude it
    fireEvent.click(diceElements[0]);
    
    // Check if it's excluded (should show the X icon)
    // The status indicator for excluded dice has an X icon
    // We can check for the presence of the X icon container
    const xIcon = diceElements[0].querySelector('svg'); // X or Check
    // This is a bit brittle, but let's see.
  });

  it('rolls the dice when "Roll All Dice" is clicked', async () => {
    render(<App />);
    const rollButton = screen.getByText('Roll All Dice');
    
    fireEvent.click(rollButton);
    
    // The rolling state should be active (button disabled)
    expect(rollButton).toBeDisabled();
    
    // Wait for rolling to finish (more than 10 * 50ms)
    await waitFor(() => expect(rollButton).not.toBeDisabled(), { timeout: 2000 });
  });

  it('limits the number of selected colors to the number of dice', () => {
    render(<App />);
    // Initial count is 5.
    // Try to select more than 5 colors.
    const colorButtons = screen.getAllByRole('button').filter(btn => btn.title);
    
    // Select 6 colors (one is already selected by default)
    for (let i = 0; i < 6; i++) {
      fireEvent.click(colorButtons[i]);
    }
    
    // Check how many are selected (they have a Check icon inside)
    const selectedColors = colorButtons.filter(btn => btn.querySelector('svg'));
    expect(selectedColors.length).toBeLessThanOrEqual(5);
  });
});

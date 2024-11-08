export const generateRandomSixDigitNumber = () => {
    // Generate a random number between 0 (inclusive) and 1 (exclusive)
    const randomNumber = Math.random();
  
    // Scale the number to be between 100000 and 999999
    const scaledNumber = randomNumber * 900000 + 100000;
  
    // Round down to get an integer
    const sixDigitNumber = Math.floor(scaledNumber);
  
    return sixDigitNumber;
  }
  
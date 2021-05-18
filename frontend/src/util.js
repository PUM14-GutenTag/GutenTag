// Generates a random color HSL colors
export const generateRandomColor = () => {
  return `hsl(${360 * Math.random()}, ${50 + 50 * Math.random()}%, ${30 + 20 * Math.random()}%)`;
};

// Choose size of the text to use depending on the length of the text data
export const textBoxSize = (data) => {
  const lengthOfData = data.length;
  if (lengthOfData < 30) {
    return '40px';
  }
  if (lengthOfData < 110) {
    return '30px';
  }
  if (lengthOfData < 300) {
    return '20px';
  }
  return '15px';
};

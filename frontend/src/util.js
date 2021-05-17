// Generates a random color HSL colors
export const generateRandomColor = () => {
  return `hsl(${360 * Math.random()}, ${75 + 25 * Math.random()}%, ${50 + 15 * Math.random()}%)`;
};

// Choose size of the text to use depending on the length of the text data
export const textBoxSize = (data) => {
  const lengthOfData = data.length;
  if (lengthOfData < 30) {
    return '40px';
  } else if (lengthOfData < 110) {
    return '30px';
  } else if (lengthOfData < 300) {
    return '20px';
  } else {
    return '15px';
  }
};

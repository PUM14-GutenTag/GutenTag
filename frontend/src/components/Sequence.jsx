import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import '../css/Sequence.css';
import HTTPLauncher from '../services/HTTPLauncher';

/* 
Component that shows the specifics for sequence labeling 
*/
const Sequence = ({
  data,
  dataPointId,
  getSetLabels,
  textBoxSize,
  labels,
  generateRandomColor,
}) => {
  const [startIndex, setStartIndex] = useState('');
  const [endIndex, setEndIndex] = useState('');
  const inputRef = useRef();
  const [selection, setSelection] = useState('');
  const wordList = data.split(' ');

  // Adds a sequnece label and resets values in input and selection box
  const addLabel = async (event) => {
    event.preventDefault();
    if (inputRef.current.value !== '' && selection !== '') {
      await HTTPLauncher.sendCreateSequenceLabel(
        dataPointId,
        inputRef.current.value,
        startIndex,
        endIndex,
        generateRandomColor()
      );
      getSetLabels();
    }
    inputRef.current.value = '';
    inputRef.current.focus();
    setSelection('');
  };

  // Find start index of start word in text data and end index of end word in text data
  const findStartEndIndex = (startWord, endWord) => {
    // index characters
    let tempStartIndex = 0;
    let tempEndIndex = 0;
    // index in list
    const startWordIndex = wordList.indexOf(startWord);
    const endWordIndex = wordList.indexOf(endWord);

    wordList.forEach((element, index) => {
      if (index < startWordIndex) {
        tempStartIndex += element.length + 1;
      } else if (index === startWordIndex) {
        tempEndIndex = tempStartIndex + element.length - 1;
      } else if (index <= endWordIndex) {
        tempEndIndex += element.length + 1;
      }
    });
    return { start: tempStartIndex, end: tempEndIndex };
  };

  // Check if selection contains labeled data
  const containsLabel = (selectionIndexes) => {
    let unlabeledText = true;
    labels.forEach((label) => {
      if (
        (selectionIndexes.start <= label.begin && selectionIndexes.end >= label.begin) ||
        (selectionIndexes.start <= label.end && selectionIndexes.end >= label.end)
      ) {
        unlabeledText = false;
      }
    });
    return unlabeledText;
  };

  /* 
  Function handeling selection event listener. Makes sure 
  only text data and complete unlabeled words can be selected. 
  */
  const handleSelection = () => {
    const selectedText = window.getSelection();
    if (
      selectedText !== undefined &&
      selectedText.anchorNode !== null &&
      selectedText.toString() !== '' &&
      selectedText.toString() !== ' '
    ) {
      const currentlySelected = selectedText.toString();
      const tempWordList = currentlySelected.split(' ');

      //remove potential spaces before and after selected word or words
      if (tempWordList[0] === '') {
        tempWordList.shift();
      }
      if (tempWordList[tempWordList.length - 1] === '') {
        tempWordList.pop();
      }
      // check that selection includes only complete words from text data
      if (
        wordList.includes(tempWordList[0]) &&
        wordList.includes(tempWordList[tempWordList.length - 1]) &&
        selectedText.anchorNode.parentNode.id === 'text-box-container'
      ) {
        const selectionIndexes = findStartEndIndex(
          tempWordList[0],
          tempWordList[tempWordList.length - 1]
        );
        const result = containsLabel(selectionIndexes, selectedText);
        if (result) {
          setSelection(selectedText.toString());
          setStartIndex(selectionIndexes.start);
          setEndIndex(selectionIndexes.end);
        } else {
          setSelection('');
        }
      } else {
        setSelection('');
      }
    }
  };

  // Highlightes word in if it has been labeled
  const highLightWord = (startingIndex) => {
    let highLightColor = 'black';

    // check if word is labeled
    labels.forEach((label) => {
      // only complete words can be labeled therefore end index does not need to be checked
      if (label.begin <= startingIndex && label.end > startingIndex) {
        highLightColor = label.color;
      }
    });
    return highLightColor;
  };

  const wrapWordsInSpan = (str) => {
    /*
    Wrap each word in text data in span tag
    */
    const textInSpans = str.replace(
      /\w+/g,
      (p1, p2) => `<span id="text-box-container" style="color: ${highLightWord(p2)}"}>${p1}</span>`
    );
    return <div id="text-box-container" dangerouslySetInnerHTML={{ __html: textInSpans }} />;
  };

  useEffect(() => {
    inputRef.current.value = '';
    inputRef.current.focus();
    setSelection('');
    setStartIndex('');
    setEndIndex('');
  }, [dataPointId]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelection);
    return () => {
      document.removeEventListener('selectionchange', handleSelection);
    };
    // eslint-disable-next-line
  }, [data, labels]);

  return (
    <div className="sequence-container">
      <hr className="hr-title" data-content="Text data" />
      <div id="text-box-container" className={textBoxSize}>
        {wrapWordsInSpan(data)}
      </div>
      <hr className="hr-title" data-content="Add new sequence label" />
      <div className="label-container">
        <div className="selected-text-box">
          <p className="selected-text">{selection}</p>
        </div>
        <Form onSubmit={addLabel} className="sequence-form">
          <Form.Group className="group-seq">
            <input type="text" placeholder="Enter label..." required ref={inputRef} />
          </Form.Group>
        </Form>
        <button className="btn btn-primary add-seq-btn" type="button" onClick={addLabel}>
          Add new label
        </button>
      </div>
    </div>
  );
};

Sequence.propTypes = {
  data: PropTypes.string.isRequired,
  dataPointId: PropTypes.number.isRequired,
  getSetLabels: PropTypes.func.isRequired,
  textBoxSize: PropTypes.string.isRequired,
  generateRandomColor: PropTypes.func.isRequired,
  labels: PropTypes.arrayOf(
    PropTypes.shape({
      begin: PropTypes.number.isRequired,
      data_id: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      label_id: PropTypes.number.isRequired,
      user_id: PropTypes.number.isRequired,
    }).isRequired
  ).isRequired,
};

export default Sequence;

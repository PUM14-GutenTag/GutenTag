import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import '../css/Sequence.css';
import HTTPLauncher from '../services/HTTPLauncher';

const Sequence = ({ data, dataPointId, getSetLabels, textBoxSize, labels }) => {
  const [startIndex, setStartIndex] = useState('');
  const [endIndex, setEndIndex] = useState('');
  const inputRef = useRef();
  const [selection, setSelection] = useState('');
  const wordList = data.split(' ');
  // const [dataInSpans, setDataInSpans] = useState('');

  const addLabel = async (event) => {
    event.preventDefault();
    if (inputRef.current.value !== '') {
      // sendCreateSequenceLabel(dataID, label, begin, end)
      await HTTPLauncher.sendCreateSequenceLabel(
        dataPointId,
        inputRef.current.value,
        startIndex,
        endIndex
      );
      getSetLabels();
    }
    inputRef.current.value = '';
    inputRef.current.focus();
  };

  // add all index of words before tempWord in wordList to get startIndex, add alla index of
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

      // check that selection includes only full words
      if (
        wordList.includes(tempWordList[0]) &&
        wordList.includes(tempWordList[tempWordList.length - 1]) &&
        selectedText.anchorNode.parentNode.id === 'text-box-container'
      ) {
        const result = findStartEndIndex(tempWordList[0], tempWordList[tempWordList.length - 1]);
        let unlabeledText = true;
        labels.forEach((label) => {
          if (
            (result.start >= label.begin && result.start < label.end) ||
            (result.end <= label.end && result.end > label.begin)
          ) {
            unlabeledText = false;
          }
        });
        if (unlabeledText) {
          setSelection(selectedText.toString());
          setStartIndex(result.start);
          setEndIndex(result.end);
        }
      }
    }
  };

  const generateRandomColor = () => {
    const green = Math.floor(1 + Math.random() * 256 * 1.7);
    const blue = Math.floor(2 + Math.random() * 256 * 1.2);
    const red = Math.floor(1 + Math.random() * 256 * 1.7);
    return `rgb(${red}, ${green}, ${blue})`;
  };

  const colorLabelData = (param1) => {
    // if it is a label do color
    console.log(param1);
    // else return default black
  };

  const wrapWordsInSpan = (str) => {
    // style={{ backgroundColor: generateRandomColor() }}
    const textInSpans = str.replace(
      /\w+/g,
      `<span id="text-box-container" style="color: ${colorLabelData($&)}"}>$&</span>`
    );

    // const textInSpans = wordList.map(word =>word.replace( `<span id="text-box-container" style="color: ${colorLabelData(word)}"}>$&</span>`))
    return <div dangerouslySetInnerHTML={{ __html: textInSpans }} />;
  };

  useEffect(() => {
    inputRef.current.value = '';
    inputRef.current.focus();
    // setDataInSpans(wrapWordsInSpan(data));
    setSelection('');
    setStartIndex('');
    setEndIndex('');
  }, [dataPointId]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelection);
    // setWordList(data.split(' '));
    // setDataInSpans(wrapWordsInSpan(data));
    // eslint-disable-next-line
    return () => {
      document.removeEventListener('selectionchange', handleSelection);
    };
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
          {/* change type to submit */}
          Add new label
        </button>
      </div>
      <p>
        Selected Text: {selection}, Start index: {startIndex}, End index: {endIndex}
      </p>
    </div>
  );
};

Sequence.propTypes = {
  data: PropTypes.string.isRequired,
  dataPointId: PropTypes.number.isRequired,
  getSetLabels: PropTypes.func.isRequired,
  textBoxSize: PropTypes.string.isRequired,
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

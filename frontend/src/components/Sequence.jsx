import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import '../css/Sequence.css';
import HTTPLauncher from '../services/HTTPLauncher';

const Sequence = ({ data, dataPointId, getSetLabels, textBoxSize, labels, setData }) => {
  const [startIndex, setStartIndex] = useState('');
  const [endIndex, setEndIndex] = useState('');
  const inputRef = useRef();
  const [selection, setSelection] = useState('');
  // const [wordList, setWordList] = useState([]);
  // const wordList = data.split(' ');
  const [dataInSpans, setDataInSpans] = useState('');

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
    const wordList = data.split(' ');
    // index characters
    let tempStartIndex = 0;
    let tempEndIndex = 0;
    // index in list
    const startWordIndex = wordList.indexOf(startWord);
    const endWordIndex = wordList.indexOf(endWord);
    console.log('startWordIndex: ', startWordIndex);
    console.log('endWordIndex: ', endWordIndex);
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
      const wordList = data.split(' ');

      // check that selection includes only full words
      console.log('wordList ', wordList);
      console.log('wordList0 ', tempWordList[0]);
      console.log('wordList-1 ', tempWordList[tempWordList.length - 1]);

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
        console.log('labels: ', labels);
        if (unlabeledText) {
          setSelection(selectedText.toString());
          setStartIndex(result.start);
          setEndIndex(result.end);
        }
      }
    }
  };

  const styleTextData = () => {};

  const wrapWordsInSpan = (str) => {
    const after = str.replace(/\w+/g, '<span id="text-box-container">$&</span>');
    return <div dangerouslySetInnerHTML={{ __html: after }} />;
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
    // markTextData();
  }, [labels]);

  useEffect(() => {
    document.removeEventListener('selectionchange', handleSelection);
    addEventListener('selectionchange', handleSelection);
    // setDataInSpans(wrapWordsInSpan(data));
    // eslint-disable-next-line
  }, [data]);

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

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import '../css/Sequence.css';
import HTTPLauncher from '../services/HTTPLauncher';

/*
TODO: 
fixa så det bara är en knapp som används för toggle och inte två
gör så att det inte går att trycka i själva knap
 */

const Sequence = ({ data, dataPointId, getSetLabels, textBoxSize, labels, setData }) => {
  const [startIndex, setStartIndex] = useState('');
  const [endIndex, setEndIndex] = useState('');
  const inputRef = useRef();
  const [selection, setSelection] = useState('');

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

  const handleSelection = () => {
    const selectedText = window.getSelection();
    if (
      selectedText !== undefined &&
      selectedText.anchorNode !== null &&
      selectedText.toString() !== '' &&
      selectedText.toString() !== ' '
    ) {
      console.log('fist iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii');
      const indexBefore = selectedText.getRangeAt(0).startOffset - 1;
      const indexAfter = selectedText.getRangeAt(0).endOffset;
      if (
        selectedText.anchorNode.parentNode.id === 'text-box-container' &&
        (selectedText.anchorNode.data[indexBefore] === ' ' ||
          selectedText.anchorNode.data[indexBefore] === undefined) &&
        (selectedText.anchorNode.data[indexAfter] === undefined ||
          selectedText.anchorNode.data[indexAfter] === ' ')
      ) {
        console.log('second iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii');
        setSelection(selectedText.toString());
        setStartIndex(selectedText.getRangeAt(0).startOffset);
        setEndIndex(selectedText.getRangeAt(0).endOffset - 1);
      }
    }
  };

  const markTextData = () => {
    if (labels.length > 0) {
      let str = data.slice();

      for (let i = 0; i < labels.length; i++) {
        const begin = labels[i].begin;
        const end = labels[i].end;
        str = `${str.substr(0, begin)}<span class="hilite">${str.substr(
          begin,
          end - begin + 1
        )}</span>${str.substr(end + 1)}`;
      }
      // do functuion, return value, do function, return value

      return <div id="text-box-container" dangerouslySetInnerHTML={{ __html: str }} />;
    }

    return `${data}`;
  };

  useEffect(() => {
    inputRef.current.value = '';
    inputRef.current.focus();

    setSelection('');
    setStartIndex('');
    setEndIndex('');
  }, [dataPointId]);

  useEffect(() => {
    // markTextData();
  }, [labels]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelection);

    // eslint-disable-next-line
  }, []);

  return (
    <div className="sequence-container">
      <hr className="hr-title" data-content="Text data" />
      <div className="text-box-container">
        <div id="text-box-container" className={textBoxSize}>
          {markTextData()}
        </div>
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

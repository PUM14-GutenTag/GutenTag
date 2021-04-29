import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import HTTPLauncher from '../services/HTTPLauncher';
import '../css/Sequence.css';
import Label from './Label';
// import HTTPLauncher from '../services/HTTPLauncher';

/*
TODO: 
fixa så det bara är en knapp som används för toggle och inte två
gör så att det inte går att trycka i själva knap
 */

const Sequence = ({ data, dataPointId }) => {
  const [labelString, setLabelString] = useState('');
  const [startIndex, setStartIndex] = useState('');
  const [endIndex, setEndIndex] = useState('');
  const inputRef = useRef();
  const [selection, setSelection] = useState('');
  const [labels, setLabels] = useState([]);

  const addLabel = () => {
    const label = {};
    label.id = Math.floor(Math.random() * 100001);
    label.label = labelString;
    label.start = startIndex;
    label.end = endIndex;
    label.data = selection;
    console.log(labelString);
    console.log(startIndex);
    console.log(endIndex);
    /* const response = HTTPLauncher.sendCreateSequenceLabel(
      dataPointId,
      labelString,
      startIndex,
      endIndex
    ); */
    const tempLabels = labels.slice();
    tempLabels.push(label);
    setLabels(tempLabels);
    console.log('label: ', label);
    console.log('labels: ', tempLabels);
  };

  const handleSelection = () => {
    const selectedText = window.getSelection();

    if (
      selectedText.anchorNode != null &&
      selectedText.toString() !== '' &&
      selectedText.toString() !== ' '
    ) {
      if (selectedText.anchorNode.parentNode.id === 'text-box-container') {
        setSelection(selectedText.toString());
        setStartIndex(selectedText.getRangeAt(0).startOffset);
        setEndIndex(selectedText.getRangeAt(0).endOffset - 1);
      }
    }
  };

  useEffect(() => {
    inputRef.current.value = '';
    inputRef.current.focus();
  }, [dataPointId]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelection);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="sequence-container">
      <hr className="hr-title" data-content="Suggestions" />
      <h4>Display label suggestions</h4>
      <hr className="hr-title" data-content="Text data" />
      <div className="text-box-container">
        <p id="text-box-container">{data}</p>
      </div>
      <hr className="hr-title" data-content="Add new label" />
      <div className="label-container">
        <div className="display-text">{selection}</div>
        <Form onSubmit={addLabel} className="sequence-form">
          <Form.Group className="group-seq">
            <input
              type="text"
              onChange={(event) => setLabelString(event.target.value)}
              placeholder="Enter label..."
              required
              ref={inputRef}
            />
            <button className="btn btn-primary" type="button" onClick={addLabel}>
              {/* change type to submit */}
              Add new label
            </button>
          </Form.Group>
        </Form>
      </div>
      <p>
        Selected Text: {selection}, Start index: {startIndex}, End index: {endIndex}
      </p>
      <hr className="hr-title" data-content="Labels" />
      {labels.map((label) => (
        <div key={label.id}>
          <Label label={label.label} data={label.data} />
        </div>
      ))}
    </div>
  );
};

Sequence.propTypes = {
  data: PropTypes.string.isRequired,
  dataPointId: PropTypes.number.isRequired,
};

export default Sequence;
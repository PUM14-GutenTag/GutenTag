import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Table from 'react-bootstrap/Table';

import HTTPLauncher from '../services/HTTPLauncher';

// List that displays the user's statistics
const StatList = ({ className }) => {
  const [stats, setStats] = useState([]);

  // Get all user stats to display
  const getStats = async () => {
    const response = await HTTPLauncher.sendGetStatistics();
    const sorted = response.data.sort((a, b) => (a.name > b.name ? 1 : -1));
    setStats(sorted);
  };

  useEffect(() => getStats(), []);

  return (
    <Table className={`users-table ${className}`} striped borderless hover size="sm">
      <thead>
        <tr>
          <th>Statistic</th>
          <th>Occurances</th>
          <th>Ranking</th>
        </tr>
      </thead>
      <tbody>
        {stats.map((stat) => (
          <tr key={stat.name}>
            <td>{stat.name}</td>
            <td>{stat.occurances}</td>
            <td>{stat.ranking}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

StatList.propTypes = {
  className: PropTypes.string,
};

StatList.defaultProps = {
  className: null,
};

export default StatList;

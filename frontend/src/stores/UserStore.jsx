import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';

// Reducer pattern similar to Redux.
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACCESS_LEVEL':
      return {
        ...state,
        access_level: action.value,
      };
    default:
      return state;
  }
};

const initialState = { access_level: 0 };
export const UserContext = createContext(initialState);

const UserStore = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <UserContext.Provider value={[state, dispatch]}>{children}</UserContext.Provider>;
};
UserStore.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserStore;

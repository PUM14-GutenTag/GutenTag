import React, { createContext, useReducer, useContext } from 'react';
import PropTypes from 'prop-types';

// Flux pattern similar to Redux.
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_IS_ADMIN':
      return {
        ...state,
        isAdmin: action.value,
      };
    default:
      return state;
  }
};

const initialState = { isAdmin: false };
const UserContext = createContext();

/*
 * Returns a {state, dispatch} which can be used to read and update the user state, respectively.
 * dispatch takes an { type, value } argument. Ex: dispatch({type: 'SET_IS_ADMIN', value: true});
 */
const useUser = () => {
  const context = useContext(UserContext);
  if (context == null) throw new Error('useUser must be used within a UserProvider');
  return context;
};

// Context provider. Needs to be wrapped around components that want to reach the user context.
const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <UserContext.Provider value={{ state, dispatch }}>{children}</UserContext.Provider>;
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { UserProvider, useUser };

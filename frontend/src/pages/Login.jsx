import React from 'react';
import '../css/Login.css';

function Login() {
    return(
        <div className="login-wrapper">
          <h1>Please Log In</h1>
          <form>
            <label>
              <p>Username</p>
              <input className="input-box" type="text" />
            </label>
            <label>
              <p>Password</p>
              <input className="input-box" type="password" />
            </label>
            <div>
              <button type="submit">Submit</button>
            </div>
          </form>
        </div>
      )
    }

export default Login;
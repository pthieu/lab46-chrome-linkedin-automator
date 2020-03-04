import React from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';

import Home from './Home';
import theme from './lib/theme';

import './App.css'

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
        <Home />
      </div>
    </MuiThemeProvider>
  );
}

export default App;

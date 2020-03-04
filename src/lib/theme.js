import { createMuiTheme } from '@material-ui/core/styles';

const theme = {
  overrides: {
    MuiButton: {
      root: {
        margin: '5px'
      }
    },
    MuiPaper: {
      root: {
        margin: '15px',
        padding: '15px',
      },
    },
  },
};

export default createMuiTheme(theme);

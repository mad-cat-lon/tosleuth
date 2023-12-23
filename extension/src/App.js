import './App.css';
import AutoAnalyzeButton from './components/AutoAnalyzeButton';
import AnalyzeButton from './components/AnalyzeButton';
import AnalysisResults from './components/AnalysisResults';
import TestButton from './components/TestButton';

import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { Container, Paper, Box, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const theme = createTheme({
  typography: {
    fontFamily: 'monospace, Arial',
    button: {
      fontSize: '1.5rem',
    },
    body1: {
      fontSize: '1.2rem',
    },
  }
})

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Container>
          <Stack
            justifyContent="center"
            alignItems="center"
            divider={<Divider orientation="horizontal" flexItem />}
            spacing={2}
          >
            <Typography variant="h2">ToSleuth</Typography>
            <Box 
              component="img" 
              src={"padlock.png"} 
              sx={{ height: "100px", width: "100px" }} 
            />
          <Stack
            spacing={1}
          >
            <TestButton/>
            <AutoAnalyzeButton/>
            <AnalyzeButton/>
          </Stack>
          <AnalysisResults/>
          </Stack>
        </Container>
      </ThemeProvider>
    </div>
  );
}

export default App;

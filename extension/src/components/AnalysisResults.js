import * as React from 'react';
import { useEffect, useState } from 'react';
import { LinearProgress } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import browser from 'webextension-polyfill';
import Container from '@mui/material/Container';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import ScreenSearchDesktopIcon from '@mui/icons-material/ScreenSearchDesktop'
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner'
import HelpIcon from '@mui/icons-material/Help'

function generate(element) {
  return [0, 1, 2].map((value) =>
    React.cloneElement(element, {
      key: value,
    }),
  );
}

export default function AnalysisResults() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleMessage = (msg) => {
        if (msg.action === 'loadingResults') {
            setLoading(true);
        }
        if (msg.action === 'updateResults') {
            setData(msg.data['results']);
            setLoading(false);
        }
    };

    useEffect(() => {
        // Add message listener when component mounts
        browser.runtime.onMessage.addListener(handleMessage);

        // Cleanup listener when component unmounts
        return () => browser.runtime.onMessage.removeListener(handleMessage);
    });

    if (loading) return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    )
    if (error) return <p>Error loading data!</p>;
    
    return (
        <div>
          {data.map((item, index) => (
            <Accordion key={index}>
              <AccordionSummary 
              expandIcon={<ExpandMoreIcon/>}>
                {/* Should render icons based on point severity*/}
                <PersonSearchIcon style={{ marginRight: 8 }}/>
                <Typography>{item.tosdr_case}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense="true">
                  {/* <ListItem>
                    <ListItemIcon>
                      <HelpIcon/>
                    </ListItemIcon>
                    <Container>
                      <Typography variant="h4" gutterBottom>
                        Point explanation
                      </Typography>
                    </Container>
                  </ListItem> */}
                  <ListItem>
                    <ListItemIcon>
                      <DocumentScannerIcon/>
                    </ListItemIcon>
                    <Container>
                      <Typography variant="h5" gutterBottom>
                        Source in document
                      </Typography>
                      <Typography>
                        "{item.source_text}"
                      </Typography>
                    </Container>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ScreenSearchDesktopIcon/>
                    </ListItemIcon>
                    <Container>
                      <Typography variant="h5" gutterBottom>
                        Generated reasoning
                      </Typography>
                      <Typography>
                        {item.reason}
                      </Typography>
                    </Container>
                  </ListItem>
              </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
    );
}
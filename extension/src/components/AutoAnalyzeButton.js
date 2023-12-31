import * as React from 'react';
import Button from '@mui/material/Button';
import browser from 'webextension-polyfill';

function handleClick() {
    browser.runtime.sendMessage({ action: 'autoAnalyze' });
}

export default function AutoAnalyzeButton() {
    return <Button 
        variant="contained"
        onClick={handleClick}
    >
    Auto-discover and analyze
    </Button>
}
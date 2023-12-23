import * as React from 'react';
import Button from '@mui/material/Button';
import browser from 'webextension-polyfill';

function handleClick() {
    browser.runtime.sendMessage({ action: 'standardAnalyze' });
}

export default function AnalyzeButton() {
    return <Button 
        variant="contained"
        onClick={handleClick}
    >
    Analyze current page
    </Button>
}
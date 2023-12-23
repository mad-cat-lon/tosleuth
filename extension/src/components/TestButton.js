import * as React from 'react';
import Button from '@mui/material/Button';
import browser from 'webextension-polyfill';

function handleClick() {
    browser.runtime.sendMessage({ action: 'testSidebarResults' });
}

export default function TestButton() {
    return <Button
        variant="contained"
        onClick={handleClick}
    >
    Send test data to sidebar
    </Button>
}
import { render } from 'preact';
import { LocationProvider } from 'preact-iso';
import App from './App';

import './style.css';

render(
    <LocationProvider>
        <App />
    </LocationProvider>,
    document.getElementById('app')!
);

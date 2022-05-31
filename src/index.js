import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Fonts from './Fonts';
import './index.css';
import App from './App';
import Waitlist from './components/Waitlist';
import reportWebVitals from './reportWebVitals';

const theme = extendTheme({
  fonts: {
    heading: 'Neue Machina Ultrabold, sans-serif',
    body: 'Neue Machina Regular, sans-serif',
  },
  styles: {
    global: () => ({
      body: {
        bg: "",
      }
    })
  },
})

const root = ReactDOM.createRoot(document.getElementById('root'));
const isWaitlist = true;

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Fonts />
      {isWaitlist ? <Waitlist /> : <App />}
    </ChakraProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

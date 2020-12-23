const React = require('react');
console.log(require('react-dom'));
const ReactDOM  = require('react-dom');
const { twitch } = require('./twitch_main.js');

import App from './overlay_main';

twitch.connect(); 

ReactDOM.render(<App />, document.getElementById('root'));

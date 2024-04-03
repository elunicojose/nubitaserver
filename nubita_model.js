const fs = require('fs');

let loadFrutas = () => JSON.parse(fs.readFileSync('./data/frutas.json'));
let loadMixes = () => JSON.parse(fs.readFileSync('./data/mixes.json'));

module.exports = {loadFrutas, loadMixes}
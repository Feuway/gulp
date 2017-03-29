'use strict';
let hello = 'привет';

let world = 'мир';

let toUpperText = (text) => {
    return text.toUpperCase();
}

document.body.innerHTML = toUpperText(hello);


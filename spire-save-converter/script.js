const dropArea = document.getElementById('drop-area');
const output = document.getElementById('output');
const link = document.createElement('a');
var filename = "CHARACTER.save"
const SECRET = new TextEncoder().encode("key");
var editor;

require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.52.2/min/vs' }});
require(["vs/editor/editor.main"], function () {
    editor = monaco.editor.create(document.getElementById('textbox'), {
        language: 'json',
        theme: "vs-dark",
        scrollBeyondLastLine: false,
        value: `"JSON will appear here"`
    });
});

// Prevent default behavior for dragover and drop events
dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('hover');
});
dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('hover');
});
dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.classList.remove('hover');

    const file = event.dataTransfer.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const binary = base64ToUint8Array(content)
            const decyphered = xorWithKey(binary, SECRET)
            const jsonData = new TextDecoder().decode(decyphered);
            editor.getModel().setValue(jsonData)
        };
        reader.readAsText(file);
        filename = file.name
        output.textContent = "loaded " + file.name
    } else {
        output.textContent = 'No file selected.';
    }
});

document.getElementById('downloadBtn').addEventListener('click', function() {
    const textContent = editor.getModel().getValue()
    if (!isValidJSON(textContent)) {
        output.textContent = "Text is not a valid JSON";
        return;
    }
    const binary = new TextEncoder().encode(textContent);
    const cyphered = xorWithKey(binary, SECRET)
    const base64encoded = uint8ArrayToBase64(cyphered)
    const blob = new Blob([base64encoded], { type: 'text/plain' });
    link.href = URL.createObjectURL(blob);
    link.download = filename
    // Trigger the download
    link.click();
});

function xorWithKey(input, key) {
    const output = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i++) {
        output[i] = input[i] ^ key[i % key.length];
    }
    return output;
}

function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function base64ToUint8Array(base64) {
    if (typeof Uint8Array.fromBase64 === 'function') {
        return Uint8Array.fromBase64(base64)
    }
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function uint8ArrayToBase64(uint8Array) {
    if (typeof uint8Array.toBase64 === 'function') {
        return uint8Array.toBase64();
    }
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }
    return window.btoa(binaryString);
}
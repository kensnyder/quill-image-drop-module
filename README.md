# Quill ImageDrop Module

A module for Quill rich text editor to allow images to be pasted and drag/dropped into the editor.

## Demo

[Plunker](https://plnkr.co/edit/ubVmPkBjqQESsefM3JrT?p=preview)

## Usage

### Webpack/ES6

```javascript
import Quill from 'quill';
import { ImageDrop } from 'quill-image-drop-module';

Quill.register('modules/imageDrop', ImageDrop);

const quill = new Quill(editor, {
    // ...
    modules: {
        // ...
        imageDrop: true
    }
});
```

### Script Tag

Copy image-drop.min.js into your web root or include from node_modules

```html
<script src="/node_modules/quill-image-drop-module/image-drop.min.js"></script>
```

```javascript
var quill = new Quill(editor, {
    // ...
    modules: {
        // ...
        imageDrop: true
    }
});
```

### Options
Possiblity to automatically upload your images.

```javascript
imageDrop: {
    // direct upload configuration
    uploadImage: {
        url: "", // server url
        method: "POST", // change query method, default 'POST' 
        headers: {}, // add custom headers, example { token: 'your-token'}
        // personalize successful callback and call next function to insert new url to the editor
        callbackOK: (serverResponse, next) => {
            next(serverResponse);   
        },
        // personalize failed callback
        callbackKO: (serverError) => {
            alert(serverError);
        }
    }
} 
```
/**
 * Custom module for quilljs to allow user to drag images from their file system into the editor
 * and paste images from clipboard (Works on Chrome, Firefox, Edge, not on Safari)
 * @see https://quilljs.com/blog/building-a-custom-module/
 */
export class ImageDrop {

	/**
	 * Instantiate the module given a quill instance and any options
	 * @param {Quill} quill
	 * @param {Object} options
	 */
	constructor(quill, options = {}) {
		// save the quill reference
		this.quill = quill;
		// bind handlers to this instance
		this.handleDrop = this.handleDrop.bind(this);
		this.handlePaste = this.handlePaste.bind(this);
		// listen for drop and paste events
		this.quill.root.addEventListener('drop', this.handleDrop, false);
		this.quill.root.addEventListener('paste', this.handlePaste, false);

		// when drag image over the drag zone, ie will open the file as default behavior.
		// need to prevent the behavior so that the drop event will triggered correctly.
		if (ImageDrop.isIE()) {
			this.quill.root.addEventListener('dragover', evt => {
				evt.stopPropagation();
				evt.preventDefault();
			});
		}
	}

	/**
	 * Handler for drop event to read dropped files from evt.dataTransfer
	 * @param {Event} evt
	 */
	handleDrop(evt) {
		evt.preventDefault();
		if (evt.dataTransfer && evt.dataTransfer.files && evt.dataTransfer.files.length) {
			if (document.caretRangeFromPoint) {
				const selection = document.getSelection();
				const range = document.caretRangeFromPoint(evt.clientX, evt.clientY);
				if (selection && range) {
					selection.setBaseAndExtent(range.startContainer, range.startOffset, range.startContainer, range.startOffset);
				}
			}
			this.readFiles(evt.dataTransfer.files, this.insert.bind(this));
		}
	}

	/**
	 * Handler for paste event to read pasted files from evt.clipboardData
	 * @param {Event} evt
	 */
	handlePaste(evt) {
		// Internet explorer's clipbaordData is under window object.
		if (evt.clipboardData && evt.clipboardData.items && evt.clipboardData.items.length
			 || window.clipboardData && window.clipboardData.files && window.clipbaordData.files.length) {
			this.readFiles(evt.clipboardData.items || window.clipboardData.files, dataUrl => {
				const selection = this.quill.getSelection();
				if (selection) {
					// we must be in a browser that supports pasting (like Firefox)
					// so it has already been placed into the editor
				}
				else {
					// otherwise we wait until after the paste when this.quill.getSelection()
					// will return a valid index
					setTimeout(() => this.insert(dataUrl), 0);
				}
			});
		}
	}

	/**
	 * Insert the image into the document at the current cursor position
	 * @param {String} dataUrl  The base64-encoded image URI
	 */
	insert(dataUrl) {
		const index = (this.quill.getSelection() || {}).index || this.quill.getLength();
		this.quill.insertEmbed(index, 'image', dataUrl, 'user');
	}

	/**
	 * Extract image URIs a list of files from evt.dataTransfer or evt.clipboardData
	 * @param {File[]} files  One or more File objects
	 * @param {Function} callback  A function to send each data URI to
	 */
	readFiles(files, callback) {
		// check each file for an image
		[].forEach.call(files, file => {
			if (!file.type.match(/^image\/(gif|jpe?g|a?png|svg|webp|bmp|vnd\.microsoft\.icon)/i)) {
				// file is not an image
				// Note that some file formats such as psd start with image/* but are not readable
				return;
			}
			// set up file reader
			const reader = new FileReader();
			reader.onload = (evt) => {
				callback(evt.target.result);
			};
			// read the clipboard item or file
			const blob = file.getAsFile ? file.getAsFile() : file;
			if (blob instanceof Blob) {
				reader.readAsDataURL(blob);
			}
		});
	}

	/**
	 * detect IE
	 * returns version of IE or false, if browser is not Internet Explorer
	 */
	static ieIE() {
		const ua = window.navigator.userAgent;

		const msie = ua.indexOf('MSIE ');
		if (msie > 0) {
			// IE 10 or older => return version number
			return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		}

		const trident = ua.indexOf('Trident/');
		if (trident > 0) {
			// IE 11 => return version number
			var rv = ua.indexOf('rv:');
			return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
		}

		const edge = ua.indexOf('Edge/');
		if (edge > 0) {
			// Edge (IE 12+) => return version number
			return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
		}

			// other browser
			return false;
	}
}

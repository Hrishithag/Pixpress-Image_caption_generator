# Pixpress

Pixpress is an AI-powered image caption generator web application. Users can upload or drag and drop an image, generate a caption with a BLIP image captioning model, listen to the caption with speech synthesis, copy it, download it, and revisit recent captions from local history.

## Features

- AI image caption generation with BLIP
- Image upload through file picker
- Drag-and-drop upload support
- Image preview before/while captioning
- Loading spinner and friendly status messages
- Text-to-speech caption playback
- Copy caption to clipboard
- Download caption as a `.txt` file
- Caption history stored in `localStorage`
- Light and dark theme toggle
- Frontend validation for non-image files
- Backend validation for invalid, corrupted, oversized, or malformed uploads

## Screenshots

Add screenshots of the light theme, dark theme, and generated caption state here.

```text
screenshots/
  light-theme.png
  dark-theme.png
  generated-caption.png
```

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Python, Flask
- AI model: Salesforce BLIP image captioning model
- Image handling: Pillow
- ML libraries: PyTorch, Transformers

## Installation

1. Create and activate a virtual environment:

```bash
python -m venv .venv
.venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Start the Flask server:

```bash
python app.py
```

4. Open the app in your browser:

```text
http://127.0.0.1:5000
```

If you open `index.html` directly from the filesystem, the relative `/caption` API path will not reach Flask. Run the Flask server for caption generation.

## Folder Structure

```text
pixpress/
  app.py
  index.html
  style.css
  script.js
  requirements.txt
  README.md
  .gitignore
  assets/
    logo.png
  uploads/
    .gitkeep
```

## Usage

1. Start the Flask server.
2. Open Pixpress in a browser.
3. Upload an image or drag and drop it onto the upload card.
4. Wait for the caption to generate.
5. Play, copy, download, or restore captions from history.
6. Use the theme toggle to switch between light and dark mode.

## API Endpoints

### `POST /caption`

Generates a caption for an uploaded image.

Request:

```text
multipart/form-data
image: PNG, JPG, JPEG, or BMP file under 5 MB
```

Success response:

```json
{
  "success": true,
  "caption": "a dog sitting on a couch"
}
```

Error response:

```json
{
  "success": false,
  "message": "Invalid file type. Please upload a PNG, JPG, JPEG, or BMP image."
}
```

### `GET /ping`

Checks whether the backend is running.

Response:

```json
{
  "message": "BLIP model is loaded and ready"
}
```

## Future Improvements

- Add screenshot assets for the README.
- Add automated backend tests for upload validation.
- Add deployment configuration for Render, Railway, or Docker.
- Add optional GPU model configuration for faster inference.
- Add support for more image formats such as WEBP.

## License

This project is available for educational and portfolio use. Add your preferred license before publishing.

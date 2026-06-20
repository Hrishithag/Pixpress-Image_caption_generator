# Pixpress

Pixpress is an AI-powered image caption generator built using Flask and the Salesforce BLIP image captioning model. Users can upload or drag and drop an image and receive automatically generated captions through a clean and responsive interface.

---

## Features

- 🤖 AI-powered image caption generation
- 🖼 Image upload with preview
- 📂 Drag-and-drop upload support
- ⚡ Loading spinner and status messages
- 🔊 Speech synthesis for captions
- 📋 Copy caption to clipboard
- 📥 Download caption as a text file
- 📝 Caption history using localStorage
- 🌙 Light and dark mode support
- 📱 Responsive UI
- ✅ Input validation and error handling
- 🛡 Backend validation for invalid or corrupted images

---

## Screenshots

### Light Mode

![Light Mode](assets/light_mode.png)

### Dark Mode

![Dark Mode](assets/dark_mode.png)

### Logo

![Logo](assets/logo.png)

---

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Python
- Flask

### AI Model
- Salesforce BLIP Image Captioning Model

### Libraries
- Transformers
- PyTorch
- Pillow

---

## Project Structure

```text
pixpress/
│
├── assets/
│   ├── light_mode.png
│   ├── dark_mode.png
│   └── logo.png
│
├── uploads/
│   └── .gitkeep
│
├── app.py
├── index.html
├── style.css
├── script.js
├── requirements.txt
├── README.md
└── .gitignore
```

---

## How It Works

1. User uploads an image or drags and drops it.
2. The image is sent to the Flask backend.
3. The Salesforce BLIP model generates a caption.
4. The caption is displayed on the webpage.
5. Users can:
   - Listen to the caption
   - Copy it to clipboard
   - Download it as a text file
   - Restore previous captions from history
   - Switch between light and dark mode

---

## Installation

### Clone the repository

```bash
git clone https://github.com/Hrishithag/pixpress.git
cd pixpress
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Run the application

```bash
python app.py
```

Open:

```text
http://127.0.0.1:5000
```

---

## API Endpoints

### POST /caption

Generates a caption for an uploaded image.

#### Success Response

```json
{
  "success": true,
  "caption": "a dog sitting on a couch"
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Invalid file type. Please upload a PNG, JPG, JPEG, or BMP image."
}
```

---

### GET /ping

Checks whether the backend is running.

#### Response

```json
{
  "message": "BLIP model is loaded and ready"
}
```

---

## Future Improvements

- Multi-language captions
- Multiple caption styles
- Caption export as PDF
- Deployment using Render or Docker
- GPU acceleration support
- Support for additional image formats

---

## License

This project is open source and intended for educational and portfolio purposes.

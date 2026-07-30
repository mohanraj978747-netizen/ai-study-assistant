import Note from '../models/Note.model.js';
import { summarizeText } from '../utils/aiServiceClient.js';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';

async function extractPdfText(buffer) {
  const doc = await getDocument({ data: new Uint8Array(buffer), verbosity: 0 }).promise;
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + '\n';
  }
  return text.trim();
}

async function extractText(file) {
  const { mimetype, buffer, originalname } = file;

  if (mimetype === 'text/plain') {
    return buffer.toString('utf-8');
  }
  if (mimetype === 'application/pdf') {
    return extractPdfText(buffer);
  }
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  const err = new Error(
    `Could not extract text from ${originalname}. Legacy .doc files aren't fully supported yet - please upload PDF, DOCX or TXT.`
  );
  err.statusCode = 415;
  throw err;
}

export async function getNotes(req, res, next) {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (err) {
    next(err);
  }
}

export async function uploadNote(req, res, next) {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    const content = await extractText(req.file);

    let summary;
    try {
      summary = await summarizeText(content);
    } catch (err) {
      console.error('AI summarization failed:', err.message);
      summary = 'Summary could not be generated right now, but your note was still saved.';
    }

    const note = await Note.create({
      user: req.user._id,
      title: req.file.originalname.replace(/\.[^/.]+$/, ''),
      filename: req.file.originalname,
      content,
      summary,
    });

    res.status(201).json({ note });
  } catch (err) {
    if (err.statusCode) res.status(err.statusCode);
    next(err);
  }
}

export async function getNoteById(req, res, next) {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }
    res.json({ note });
  } catch (err) {
    next(err);
  }
}

export async function deleteNote(req, res, next) {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }
    res.json({ message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
}

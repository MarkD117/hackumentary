const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Method override
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Set default layout
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layout');

mongoose.connect('mongodb+srv://Hackumentary:<SECRET_PASSWORD>cluster0.gcr9lro.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Blog Schema
const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    comments: [String]
});

const Blog = mongoose.model('Blog', blogSchema);

// Routes

// Home page
app.get('/', (req, res) => {
    res.render('index');
});

// About page
app.get('/about', (req, res) => {
    res.render('about');
});

// Content page
app.get('/content', (req, res) => {
    res.render('content');
});

// View all blogs
app.get('/blogs', async (req, res) => {
    const blogs = await Blog.find();
    res.render('blogs', { blogs });
});

// New blog form
app.get('/blogs/new', (req, res) => {
    res.render('newBlog');
});

// Handle blog creation
app.post('/blogs', async (req, res) => {
    const { title, content } = req.body;
    const blog = new Blog({ title, content });
    await blog.save();
    res.redirect('/blogs');
});

// View a single blog
app.get('/blogs/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    res.render('blogDetail', { blog });
});

// Add comment
app.post('/blogs/:id/comments', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    blog.comments.push(req.body.comment);
    await blog.save();
    res.redirect(`/blogs/${req.params.id}`);
});

// Edit blog form
app.get('/blogs/:id/edit', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.render('editBlog', { blog });
});

// Handle update
app.put('/blogs/:id', async (req, res) => {
  const { title, content } = req.body;
  await Blog.findByIdAndUpdate(req.params.id, { title, content });
  res.redirect(`/blogs/${req.params.id}`);
});

// Handle delete
app.delete('/blogs/:id', async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.redirect('/blogs');
});

// Edit comment form
app.get('/blogs/:id/comments/:index/edit', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  const comment = blog.comments[req.params.index];
  res.render('editComment', { blog, comment, index: req.params.index });
});

// Handle comment update
app.put('/blogs/:id/comments/:index', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  blog.comments[req.params.index] = req.body.comment;
  await blog.save();
  res.redirect(`/blogs/${req.params.id}`);
});

// Handle comment delete
app.delete('/blogs/:id/comments/:index', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  blog.comments.splice(req.params.index, 1);
  await blog.save();
  res.redirect(`/blogs/${req.params.id}`);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

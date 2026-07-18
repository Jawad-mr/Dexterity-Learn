import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Models
import User from '../models/User.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Book from '../models/Book.js';
import Category from '../models/Category.js';
import Announcement from '../models/Announcement.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected for seeding...");

    // Clear existing collections
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Book.deleteMany({});
    await Category.deleteMany({});
    await Announcement.deleteMany({});
    console.log("Cleaned up existing database records.");

    // 1. Seed Categories
    const categories = await Category.insertMany([
      { name: 'Web Development', slug: 'web-development', icon: 'Layout' },
      { name: 'Programming', slug: 'programming', icon: 'Code' },
      { name: 'AI & Machine Learning', slug: 'ai-machine-learning', icon: 'Cpu' },
      { name: 'Interview & Career', slug: 'interview-career', icon: 'Briefcase' },
    ]);
    console.log("Categories seeded!");

    // 2. Seed Users (passwords will be hashed via Schema pre-save)
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const users = await User.insertMany([
      {
        username: 'admin',
        email: 'admin@dexteritylearn.com',
        password: 'admin123', // Raw password (will be hashed by pre-save)
        role: 'admin',
        isVerified: true,
        progress: {
          xp: 1500,
          streak: 12,
          badges: ['Code Master', 'Elite Admin'],
        },
      },
      {
        username: 'student',
        email: 'student@dexteritylearn.com',
        password: 'user123', // Raw password (will be hashed by pre-save)
        role: 'user',
        isVerified: true,
        progress: {
          xp: 250,
          streak: 3,
          badges: ['Code Novice'],
        },
      },
    ]);
    console.log("Users seeded!");

    // 3. Seed Announcements
    await Announcement.insertMany([
      {
        title: 'Complete MERN Stack Rewrite Active!',
        content: 'Welcome to the brand new Dexterity Learn app. Enjoy smooth page transitions, PWA offline reading, and robust course progress tracking!',
        category: 'Feature Launch',
        active: true,
      },
      {
        title: 'Claim Professional Certifications',
        content: 'Finish 100% of any course syllabus, complete quizzes, and unlock your formal certificate for download.',
        category: 'General',
        active: true,
      },
    ]);
    console.log("Announcements seeded!");

    // 4. Seed Books (First 3 pages are free, pages 4+ will trigger paywall)
    const books = await Book.insertMany([
      {
        title: 'Python Notes for Professionals',
        slug: 'python-notes-for-professionals',
        description: 'Accelerate your Python expertise with this comprehensive reference guide. Contains notes, cheat sheets, and idiomatic samples.',
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80',
        author: 'JSN Creative',
        price: 199,
        rating: 4.8,
        pages: [
          {
            pageNumber: 1,
            content: '# Chapter 1: Introduction to Python\n\nPython is an interpreted, high-level, general-purpose programming language. Created by Guido van Rossum and first released in 1991, Python\'s design philosophy emphasizes code readability with its notable use of significant whitespace.',
            readingTime: '2 mins',
          },
          {
            pageNumber: 2,
            content: '# Chapter 2: Python Syntax & Variables\n\nIn Python, variables are created when you assign a value to it. Python has no command for declaring a variable.\n\n```python\nx = 5\ny = "Hello, World!"\nprint(x)\nprint(y)\n```\nIndentation in Python is very important. It refers to the spaces at the beginning of a code line.',
            readingTime: '3 mins',
          },
          {
            pageNumber: 3,
            content: '# Chapter 3: Control Flow Structures\n\nPython supports the usual logical conditions from mathematics: `if`, `elif`, `else` statements.\n\n```python\na = 33\nb = 200\nif b > a:\n    print("b is greater than a")\n```\nThis concludes the free chapters. Learn about lists, loops, and OOP concepts on the next page!',
            readingTime: '3 mins',
          },
          {
            pageNumber: 4,
            content: '# Chapter 4: Data Structures (Lists, Tuples, Dicts)\n\nLists are used to store multiple items in a single variable. Lists are one of 4 built-in data types in Python used to store collections of data, the other 3 are Tuple, Set, and Dictionary.\n\n```python\nthislist = ["apple", "banana", "cherry"]\nprint(thislist)\n```',
            readingTime: '4 mins',
          },
          {
            pageNumber: 5,
            content: '# Chapter 5: Object-Oriented Programming in Python\n\nPython is an object-oriented programming language. Almost everything in Python is an object, with its properties and methods. A Class is like an object constructor, or a "blueprint" for creating objects.\n\n```python\nclass MyClass:\n  x = 5\n\np1 = MyClass()\nprint(p1.x)\n```',
            readingTime: '5 mins',
          },
        ],
      },
      {
        title: 'Sleek CSS Layout Masterclass',
        slug: 'sleek-css-layout-masterclass',
        description: 'Master Flexbox, Grid layouts, custom variables, and responsive design systems using pure Vanilla CSS.',
        coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&q=80',
        author: 'Muhammad Jawad M R',
        price: 299,
        rating: 4.9,
        pages: [
          {
            pageNumber: 1,
            content: '# Chapter 1: The CSS Box Model\n\nAll HTML elements can be considered as boxes. In CSS, the term "box model" is used when talking about design and layout. The CSS box model is essentially a box that wraps around every HTML element. It consists of: margins, borders, padding, and the actual content.',
            readingTime: '2 mins',
          },
          {
            pageNumber: 2,
            content: '# Chapter 2: Flexbox Fundamentals\n\nThe Flexible Box Layout Module, makes it easier to design flexible responsive layout structure without using float or positioning.\n\n```css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n```',
            readingTime: '3 mins',
          },
          {
            pageNumber: 3,
            content: '# Chapter 3: Grid Layout Basics\n\nThe CSS Grid Layout Module offers a grid-based layout system, with rows and columns, making it easier to design web pages without having to use floats and positioning.\n\n```css\n.grid-container {\n  display: grid;\n  grid-template-columns: auto auto auto;\n}\n```',
            readingTime: '3 mins',
          },
          {
            pageNumber: 4,
            content: '# Chapter 4: CSS Custom Properties (Variables)\n\nCSS variables have access to the DOM, which means you can change them with JavaScript, modify them on media queries, or inherit them.\n\n```css\n:root {\n  --main-bg-color: #0d9488;\n}\n.panel {\n  background-color: var(--main-bg-color);\n}\n```',
            readingTime: '4 mins',
          },
        ],
      },
    ]);
    console.log("Books seeded!");

    // 5. Seed Courses & Lessons
    const htmlCourse = await Course.create({
      title: 'HTML Basics',
      slug: 'html-basics',
      description: 'The definitive guide to learning HyperText Markup Language. Learn structure, forms, inputs, and semantic page layouts.',
      shortDescription: 'Learn structural markup, elements, tables, forms, and HTML5 semantic tags.',
      difficulty: 'Beginner',
      estimatedTime: '2 hours',
      category: 'Web Development',
      certificatePrice: 499,
      isDraft: false,
      image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&q=80',
      quizzes: [
        {
          question: 'What does HTML stand for?',
          options: [
            'Hyper Text Markup Language',
            'Home Tool Markup Language',
            'Hyperlinks and Text Markup Language',
            'Hyper Tool Maker Language',
          ],
          answerIndex: 0,
          explanation: 'HTML stands for Hyper Text Markup Language. It defines the structure of web pages.',
        },
        {
          question: 'Choose the correct HTML element for the largest heading:',
          options: ['<heading>', '<h6>', '<head>', '<h1>'],
          answerIndex: 3,
          explanation: '<h1> defines the most important and largest heading in HTML hierarchy.',
        },
      ],
    });

    await Lesson.insertMany([
      {
        courseId: htmlCourse._id,
        title: 'Introduction to HTML',
        slug: 'introduction-to-html',
        content: '## What is HTML?\n\nHTML is the standard markup language for creating Web pages. It describes the structure of a Web page and consists of a series of elements. HTML elements tell the browser how to display the content.\n\nHere is a simple document structure:\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n  <h1>My First Heading</h1>\n  <p>My first paragraph.</p>\n</body>\n</html>\n```',
        codeSnippets: [
          {
            language: 'html',
            code: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Title</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>',
          },
        ],
        order: 1,
      },
      {
        courseId: htmlCourse._id,
        title: 'HTML Semantic Elements',
        slug: 'html-semantic-elements',
        content: '## Semantic Elements\n\nA semantic element clearly describes its meaning to both the browser and the developer.\n\nExamples of **non-semantic** elements: `<div>` and `<span>` - Tells nothing about its content.\n\nExamples of **semantic** elements: `<form>`, `<table>`, and `<article>` - Clearly defines its content.\n\nHTML5 offers specific structure wrappers:\n- `<header>`\n- `<nav>`\n- `<main>`\n- `<section>`\n- `<article>`\n- `<footer>`',
        codeSnippets: [
          {
            language: 'html',
            code: '<main>\n  <section>\n    <h2>Articles</h2>\n    <article>Story Content</article>\n  </section>\n</main>',
          },
        ],
        order: 2,
      },
    ]);

    const jsCourse = await Course.create({
      title: 'JavaScript Basics',
      slug: 'javascript-basics',
      description: 'Master JavaScript (ES6+), the core programming language of the web. Learn data types, variables, scopes, DOM APIs, and closures.',
      shortDescription: 'Learn variables, conditions, loops, array methods, DOM manipulation, and modern ES6.',
      difficulty: 'Beginner',
      estimatedTime: '4 hours',
      category: 'Programming',
      certificatePrice: 499,
      isDraft: false,
      image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&q=80',
      quizzes: [
        {
          question: 'Inside which HTML element do we put the JavaScript code?',
          options: ['<js>', '<script>', '<scripting>', '<javascript>'],
          answerIndex: 1,
          explanation: 'JavaScript code is embedded inside <script> tags in HTML files.',
        },
        {
          question: 'How do you create a function in JavaScript?',
          options: [
            'function myFunction()',
            'function:myFunction()',
            'function = myFunction()',
            'def myFunction()',
          ],
          answerIndex: 0,
          explanation: 'The function keyword is used followed by the function name and parentheses.',
        },
      ],
    });

    await Lesson.insertMany([
      {
        courseId: jsCourse._id,
        title: 'JavaScript Syntax and Variables',
        slug: 'javascript-syntax-and-variables',
        content: '## JavaScript Statements\n\nJavaScript statements are composed of values, operators, expressions, keywords, and comments.\n\nJavaScript has three ways to declare variables:\n- `var` (old, function-scoped)\n- `let` (modern, block-scoped)\n- `const` (modern, constant block-scoped)\n\n```javascript\nlet name = "Jawad";\nconst speedOfLight = 299792458;\nconsole.log(name);\n```',
        codeSnippets: [
          {
            language: 'javascript',
            code: 'let name = "JSN";\nconst gravity = 9.8;\nconsole.log("Acceleration:", gravity);',
          },
        ],
        order: 1,
      },
      {
        courseId: jsCourse._id,
        title: 'JavaScript Arrow Functions',
        slug: 'javascript-arrow-functions',
        content: '## ES6 Arrow Functions\n\nArrow functions allow us to write shorter function syntax:\n\n```javascript\n// Traditional Function\nlet sum = function(a, b) {\n  return a + b;\n};\n\n// Arrow Function\nlet sumArrow = (a, b) => a + b;\n\nconsole.log(sumArrow(5, 10)); // 15\n```\nArrow functions do not have their own `this`. They are not suited for defining object methods.',
        codeSnippets: [
          {
            language: 'javascript',
            code: 'const double = (x) => x * 2;\nconsole.log(double(10)); // 20',
          },
        ],
        order: 2,
      },
    ]);

    console.log("Courses and Lessons seeded!");
    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    mongoose.connection.close();
  }
};

seedData();

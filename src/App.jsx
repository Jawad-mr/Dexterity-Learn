import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import CoursesCatalog from './pages/CoursesCatalog';
import EbooksCatalog from './pages/EbooksCatalog';
import Community from './pages/Community';
import LessonPage from './pages/LessonPage';
import CertConfirmation from './pages/CertConfirmation';
import EbookConfirmation from './pages/EbookConfirmation';

// Data
import courses from './data/courses.json';
import ebooks from './data/ebooks.json';
import siteConfig from './data/siteConfig.json';

// Helper to parse hash route segments and query string params
const parseHash = () => {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [path, qs] = hash.split("?");
  const segments = path.split("/").filter(Boolean);
  
  const query = {};
  if (qs) {
    qs.split("&").forEach((pair) => {
      const [k, v] = pair.split("=");
      if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || "");
    });
  }
  return { segments, query };
};

export default function App() {
  const [route, setRoute] = useState(parseHash());

  // Listen to hash routes changing
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash());
    };
    
    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const { segments, query } = route;
  const currentSegment = segments[0] || '';

  // Synchronize dynamic queries back into hash paths
  const updateQuery = (newQuery) => {
    const updatedQuery = { ...query, ...newQuery };
    
    // Remove empty parameters
    Object.keys(updatedQuery).forEach((key) => {
      if (updatedQuery[key] === undefined || updatedQuery[key] === '') {
        delete updatedQuery[key];
      }
    });

    const queryString = Object.entries(updatedQuery)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

    const path = segments.join("/");
    window.location.hash = `#/${path}` + (queryString ? `?${queryString}` : "");
  };

  // Dynamic SEO Page Meta Manager
  const updateMeta = (title, description) => {
    document.title = `${title} | ${siteConfig.name}`;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
  };

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  // Route Dispatcher
  let pageContent = null;

  if (segments.length === 0) {
    // 1. HOMEPAGE
    updateMeta(
      'Home — Free Coding Courses & Study Guides',
      'Learn HTML, CSS, JavaScript, and Python with our free text-based courses. Access guides, purchase e-books, and join our active WhatsApp community.'
    );
    pageContent = <Home />;
  } else if (currentSegment === 'courses') {
    // 2. COURSES CATALOG
    updateMeta(
      'Syllabus & Course Catalog',
      'Explore free courses on layout structures, style selectors, scripting logics, and general programming. Read lessons without logging in.'
    );
    pageContent = <CoursesCatalog query={query} updateQuery={updateQuery} />;
  } else if (currentSegment === 'ebooks') {
    // 3. EBOOKS CATALOG
    updateMeta(
      'Downloadable Study E-books',
      'Accelerate your learning curve with clean, high-quality, practical e-books on Frontend styling, Python notes, and Portfolio building.'
    );
    pageContent = <EbooksCatalog />;
  } else if (currentSegment === 'community') {
    // 4. WHATSAPP COMMUNITY HUB
    updateMeta(
      'WhatsApp Peer Study Groups',
      'Join our local WhatsApp peer group networks. Ask code questions, collaborate on projects, and get feedback.'
    );
    pageContent = <Community />;
  } else if (currentSegment === 'course' && segments[1]) {
    const courseId = segments[1];
    const course = courses.find((c) => c.id === courseId);

    if (!course) {
      // Course not found
      pageContent = <NotFound />;
    } else if (segments[2] === 'certificate-confirmation') {
      // 5. CERTIFICATE MANUAL FORM FLOW
      updateMeta(
        `Verification Confirmation — ${course.title}`,
        `Verify and request your formal certification for the ${course.title} syllabus.`
      );
      pageContent = <CertConfirmation course={course} />;
    } else {
      // 6. LESSON INTERACTIVE RUNNER
      const lessonId = segments[2]; // Default handles inside the page itself if undefined
      updateMeta(
        `${course.title} Syllabus`,
        course.shortDescription
      );
      pageContent = <LessonPage course={course} lessonId={lessonId} />;
    }
  } else if (currentSegment === 'ebook-confirmation' && segments[1]) {
    // 7. EBOOK MANUAL DOWNLOAD LAYOUT
    const ebookId = segments[1];
    const ebook = ebooks.find((e) => e.id === ebookId);

    if (ebook) {
      updateMeta(
        `E-book Download confirmation — ${ebook.title}`,
        `Access your download details and pdf links for the ${ebook.title} book guide.`
      );
      pageContent = <EbookConfirmation ebook={ebook} />;
    } else {
      pageContent = <NotFound />;
    }
  } else {
    // 8. 404 NOT FOUND
    updateMeta('Page Not Found', 'The requested resource could not be found.');
    pageContent = <NotFound />;
  }

  return (
    <>
      <Navbar currentSegment={currentSegment} />
      <div style={{ flex: 1 }}>{pageContent}</div>
      <Footer />
    </>
  );
}

// 404 component
function NotFound() {
  return (
    <section className="section">
      <div className="container not-found">
        <div className="code">404</div>
        <h2>Syllabus Page Not Found</h2>
        <p className="mute" style={{ marginBottom: '24px' }}>
          We could not resolve this course route segment. Make sure the syllabus pathway spelling is correct.
        </p>
        <a href="#/courses" className="btn btn-teal">
          Browse Free Courses
        </a>
      </div>
    </section>
  );
}

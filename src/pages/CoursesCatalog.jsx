import React from 'react';
import courses from '../data/courses.json';
import CourseCard from '../components/CourseCard';

export default function CoursesCatalog({ query = {}, updateQuery }) {
  const searchQuery = query.q || '';
  const selectedCategory = query.cat || 'All';

  // Gather unique categories dynamically
  const categories = ['All', ...new Set(courses.map((c) => c.category))];

  // Perform search and category filter matching
  const filteredCourses = courses.filter((course) => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery || 
      course.title.toLowerCase().includes(searchLower) ||
      course.shortDescription.toLowerCase().includes(searchLower) ||
      course.tags.some((tag) => tag.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  const handleSearchChange = (e) => {
    updateQuery({ q: e.target.value });
  };

  const handleCategoryChange = (e) => {
    updateQuery({ cat: e.target.value });
  };

  return (
    <div className="courses-catalog">
      <section className="page-hero">
        <div className="container">
          <h1>Course Catalog</h1>
          <p>
            {courses.length} courses completely free to read. No subscription or log-in required.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* SEARCH & FILTER CONTROLS */}
          <div className="catalog-toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="Search by course title, tag, or topic..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            
            <select 
              className="select-input" 
              value={selectedCategory} 
              onChange={handleCategoryChange}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* COURSE LIST GRID */}
          <div className="grid">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                No courses matched your query: &quot;{searchQuery}&quot; in {selectedCategory}. Try another keyword!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

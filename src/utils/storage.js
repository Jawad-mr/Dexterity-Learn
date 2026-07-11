/* =========================================================================
   LOCAL STORAGE UTILITY HELPERS
   ========================================================================= */

const STORAGE_KEYS = {
  progress: (courseId) => `dl_progress_${courseId}`,
  quiz: (courseId) => `dl_quiz_${courseId}`
};

export const progressStorage = {
  /**
   * Retrieves course progress from localStorage
   * @param {string} courseId 
   * @returns {object} { completed: Array<string> }
   */
  get(courseId) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.progress(courseId));
      return data ? JSON.parse(data) : { completed: [] };
    } catch (e) {
      console.error("Error reading localStorage progress:", e);
      return { completed: [] };
    }
  },

  /**
   * Saves course progress to localStorage
   * @param {string} courseId 
   * @param {object} data { completed: Array<string> }
   */
  save(courseId, data) {
    try {
      localStorage.setItem(STORAGE_KEYS.progress(courseId), JSON.stringify(data));
    } catch (e) {
      console.error("Error writing localStorage progress:", e);
    }
  },

  /**
   * Checks if a specific lesson is completed
   * @param {string} courseId 
   * @param {string} lessonId 
   * @returns {boolean}
   */
  isCompleted(courseId, lessonId) {
    const data = this.get(courseId);
    return data.completed.includes(lessonId);
  },

  /**
   * Toggles completion status of a lesson
   * @param {string} courseId 
   * @param {string} lessonId 
   * @returns {boolean} The new completion status
   */
  toggleCompleted(courseId, lessonId) {
    const data = this.get(courseId);
    const index = data.completed.indexOf(lessonId);
    let isNowCompleted = false;

    if (index === -1) {
      data.completed.push(lessonId);
      isNowCompleted = true;
    } else {
      data.completed.splice(index, 1);
    }

    this.save(courseId, data);
    return isNowCompleted;
  }
};

export const quizStorage = {
  /**
   * Retrieves quiz results for a course
   * @param {string} courseId 
   * @returns {object|null} { score: number, passed: boolean } or null
   */
  get(courseId) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.quiz(courseId));
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Error reading localStorage quiz:", e);
      return null;
    }
  },

  /**
   * Saves quiz results to localStorage
   * @param {string} courseId 
   * @param {object} result { score: number, passed: boolean }
   */
  save(courseId, result) {
    try {
      localStorage.setItem(STORAGE_KEYS.quiz(courseId), JSON.stringify(result));
    } catch (e) {
      console.error("Error writing localStorage quiz:", e);
    }
  }
};

/**
 * Gets a flat array of all lessons in a course
 * @param {object} course 
 * @returns {Array<object>}
 */
export function getAllLessons(course) {
  if (!course || !course.modules) return [];
  const list = [];
  course.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      list.push({
        moduleId: module.id,
        moduleTitle: module.title,
        ...lesson
      });
    });
  });
  return list;
}

/**
 * Calculates completion percentage and counts
 * @param {object} course 
 * @returns {object} { done: number, total: number, pct: number }
 */
export function getCourseProgress(course) {
  const lessons = getAllLessons(course);
  if (lessons.length === 0) return { done: 0, total: 0, pct: 0 };
  
  const progress = progressStorage.get(course.id);
  const done = lessons.filter(l => progress.completed.includes(l.id)).length;
  const pct = Math.round((done / lessons.length) * 100);
  
  return { done, total: lessons.length, pct };
}

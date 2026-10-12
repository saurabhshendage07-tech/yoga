import { initialTestimonials } from './mockData';

const TESTIMONIALS_STORAGE_KEY = 'pranaveda_testimonials_db';

function getStoredTestimonials() {
  try {
    const raw = localStorage.getItem(TESTIMONIALS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(initialTestimonials));
      return initialTestimonials;
    }
    return JSON.parse(raw);
  } catch {
    return initialTestimonials;
  }
}

function saveStoredTestimonials(testimonials) {
  try {
    localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(testimonials));
    window.dispatchEvent(new Event('pranaveda_testimonials_updated'));
  } catch (err) {
    console.error('Error saving testimonials:', err);
  }
}

/**
 * Fetch testimonials
 */
export async function getTestimonials({ onlyApproved = true } = {}) {
  let testimonials = getStoredTestimonials();
  if (onlyApproved) {
    testimonials = testimonials.filter(t => t.isApproved !== false);
  }
  testimonials.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return testimonials;
}

/**
 * Add a new testimonial
 */
export async function addTestimonial(testimonialData) {
  const testimonials = getStoredTestimonials();
  const newDoc = {
    id: `test-${Date.now()}`,
    quote: testimonialData.quote || '',
    name: testimonialData.name || 'Practitioner',
    role: testimonialData.role || 'Yoga Student',
    avatar: testimonialData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isApproved: testimonialData.isApproved !== undefined ? testimonialData.isApproved : true,
    accentClass: testimonialData.accentClass || 'yoga-card-sage',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updated = [newDoc, ...testimonials];
  saveStoredTestimonials(updated);
  return newDoc;
}

/**
 * Update testimonial
 */
export async function updateTestimonial(testimonialId, data) {
  const testimonials = getStoredTestimonials();
  const idx = testimonials.findIndex(t => t.id === testimonialId);
  if (idx === -1) {
    throw new Error('Testimonial not found');
  }

  testimonials[idx] = {
    ...testimonials[idx],
    ...data,
    updatedAt: new Date().toISOString()
  };

  saveStoredTestimonials(testimonials);
  return testimonials[idx];
}

/**
 * Delete testimonial
 */
export async function deleteTestimonial(testimonialId) {
  const testimonials = getStoredTestimonials();
  const updated = testimonials.filter(t => t.id !== testimonialId);
  saveStoredTestimonials(updated);
  return { success: true, id: testimonialId };
}

/**
 * Real-time subscription to testimonials
 */
export function subscribeToTestimonials(callback, { onlyApproved = true } = {}) {
  const notify = () => {
    getTestimonials({ onlyApproved }).then(callback).catch(console.error);
  };

  notify();

  window.addEventListener('pranaveda_testimonials_updated', notify);
  return () => {
    window.removeEventListener('pranaveda_testimonials_updated', notify);
  };
}

import DOMPurify from 'dompurify';

export function sanitizeHtml(dirtyHtml) {
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'style', 'class']
  });
}

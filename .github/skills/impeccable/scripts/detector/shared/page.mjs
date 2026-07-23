/** Check if content looks like a full page (not a component/partial) */
function isFullPage(content) {
  let stripped = (content || '').slice(0, 65536);
  while (/<!--[\s\S]*?-->/g.test(stripped)) {
    stripped = stripped.replace(/<!--[\s\S]*?-->/g, '');
  }
  return /<!doctype\s|<html[\s>]|<head[\s>]/i.test(stripped);
}

export { isFullPage };

function buildPageTitle(value) {
  const suffix = " | Sky Fire Laser";
  const label = String(value || "Resource").replace(/\s+/g, " ").trim();
  const available = 65 - suffix.length;
  const shortened = label.length > available
    ? label.slice(0, available).replace(/\s+\S*$/, "").trim()
    : label;
  return `${shortened}${suffix}`;
}

function buildDescription(value) {
  const normalized = String(value || "")
    .replace(/[#*_`>\[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (normalized.length <= 160) return normalized;
  return `${normalized.slice(0, 157).replace(/\s+\S*$/, "").replace(/[,:;\s]+$/, "")}…`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function resolveOptimizedImageUrl(url) {
  const value = String(url || "").trim();
  const imageOverrides = {
    "https://ydbviiswxofxapccpibv.supabase.co/storage/v1/object/public/site-assets/blog/1772769062741-mpcf5ny5um.jpeg":
      "/images/blog/generated/solid-state-laser-repair-custom-solutions-source-grounded-20260509.jpg",
    "https://ydbviiswxofxapccpibv.supabase.co/storage/v1/object/public/site-assets/blog/1772436725435-4uw4yozc5td.jpg":
      "/images/blog/generated/preventive-maintenance-solid-state-lasers-source-grounded-20260509.jpg",
  };

  return imageOverrides[value] || value;
}

function renderTextInline(value) {
  const text = String(value || "");
  // Protect links/code while styling the whole inline span. The marker cannot
  // occur in user content, so literal text can never expand into a saved token.
  let marker = "\uE000";
  while (text.includes(marker)) marker += "\uE000";
  const saved = [];
  const tokens = /`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const protectedText = text.replace(tokens, (_, code, label, url) => {
    const html = code !== undefined
      ? `<code>${escapeHtml(code)}</code>`
      : `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${renderTextInline(label)}</a>`;
    return `${marker}${saved.push(html) - 1}\uE001`;
  });
  let html = escapeHtml(protectedText)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
  saved.forEach((token, index) => {
    html = html.split(`${marker}${index}\uE001`).join(token);
  });
  return html;
}

function renderMultiline(value) {
  return renderTextInline(String(value || "")).replace(/\n/g, "<br>");
}

function isHorizontalRule(line) {
  return /^\s*([-*_–—])(?:\s*\1){2,}\s*$/.test(line);
}

function isHeading(line) {
  return /^\s*#{1,6}\s+/.test(line);
}

function isUnorderedList(line) {
  return /^\s*[-*+•–—]\s+/.test(line);
}

function isOrderedList(line) {
  return /^\s*\d+[.)]\s+/.test(line);
}

function isBlockquote(line) {
  return /^\s*>\s?/.test(line);
}

function renderStructuredContent(content) {
  const normalized = String(content || "").replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  const lines = normalized.split("\n");
  const html = [];

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (isHorizontalRule(line)) {
      html.push("<hr>");
      i += 1;
      continue;
    }

    if (isHeading(line)) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = Math.min(4, match[1].length);
        html.push(`<h${level}>${renderTextInline(match[2].trim())}</h${level}>`);
        i += 1;
        continue;
      }
    }

    if (isUnorderedList(line)) {
      const items = [];
      while (i < lines.length) {
        const next = lines[i].trim();
        if (!next) break;
        if (!isUnorderedList(next)) break;
        items.push(next.replace(/^[-*+•–—]\s+/, ""));
        i += 1;
      }
      html.push(`<ul>${items.map((item) => `<li>${renderTextInline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (isOrderedList(line)) {
      const items = [];
      while (i < lines.length) {
        const next = lines[i].trim();
        if (!next) break;
        if (!isOrderedList(next)) break;
        items.push(next.replace(/^\d+[.)]\s+/, ""));
        i += 1;
      }
      html.push(`<ol>${items.map((item) => `<li>${renderTextInline(item)}</li>`).join("")}</ol>`);
      continue;
    }

    if (isBlockquote(line)) {
      const quoteLines = [];
      while (i < lines.length) {
        const next = lines[i].trim();
        if (!next) break;
        if (!isBlockquote(next)) break;
        quoteLines.push(next.replace(/^>\s?/, ""));
        i += 1;
      }
      html.push(`<blockquote>${renderMultiline(quoteLines.join("\n"))}</blockquote>`);
      continue;
    }

    const paragraphLines = [];
    while (i < lines.length) {
      const nextRaw = lines[i];
      const next = nextRaw.trim();
      if (!next) break;
      if (isHeading(next) || isHorizontalRule(next) || isUnorderedList(next) || isOrderedList(next) || isBlockquote(next)) {
        break;
      }
      paragraphLines.push(next);
      i += 1;
    }

    if (paragraphLines.length) {
      html.push(`<p>${renderMultiline(paragraphLines.join("\n"))}</p>`);
    }

    if (i < lines.length && !lines[i].trim()) {
      i += 1;
    }
  }

  return html.join("");
}


export { buildPageTitle, buildDescription, escapeHtml, formatDate, resolveOptimizedImageUrl, renderTextInline, renderStructuredContent };

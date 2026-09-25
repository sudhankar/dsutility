(function () {
  "use strict";
  var D = window.DSPDF;
  function el(id) { return document.getElementById(id); }
  function resetStatus() {
    el("textpdf-alert").hidden = true;
    el("textpdf-progress").hidden = true;
  }

  // Lightweight PDF writer. It intentionally uses PDF's built-in Helvetica
  // font so Text → PDF does not depend on a remote PDF library being loaded.
  // This keeps the tool small and reliable on static/blocked-CDN environments.
  function pdfEscape(s) {
    var out = "";
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c === 92 || c === 40 || c === 41) out += "\\" + s.charAt(i);
      else if (c >= 32 && c <= 126) out += s.charAt(i);
      else if (c === 9) out += " ";
      else if (c >= 160 && c <= 255) out += String.fromCharCode(c);
      else out += "?";
    }
    return out;
  }
  function approxWidth(text, size) { return text.length * size * 0.52; }
  function wrapLines(text, size, maxWidth) {
    var maxChars = Math.max(1, Math.floor(maxWidth / (size * 0.52)));
    var out = [];
    String(text || "").replace(/\r\n?/g, "\n").split("\n").forEach(function (paragraph) {
      if (paragraph === "") { out.push(""); return; }
      var words = paragraph.split(/\s+/), line = "";
      words.forEach(function (word) {
        if (!line) {
          while (word.length > maxChars) { out.push(word.slice(0, maxChars)); word = word.slice(maxChars); }
          line = word;
          return;
        }
        var test = line + " " + word;
        if (test.length <= maxChars || approxWidth(test, size) <= maxWidth) line = test;
        else {
          out.push(line);
          while (word.length > maxChars) { out.push(word.slice(0, maxChars)); word = word.slice(maxChars); }
          line = word;
        }
      });
      if (line) out.push(line);
    });
    return out;
  }
  function buildPdf(pages, pageW, pageH, margin, fontSize, lineHeight) {
    var objects = [];
    function add(body) { objects.push(body); return objects.length; }
    var catalogId = add("");
    var pagesId = add("");
    var fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    var pageIds = [];
    pages.forEach(function (lines) {
      var stream = "BT\n/F1 " + fontSize + " Tf\n" + (margin) + " " + (pageH - margin - fontSize) + " Td\n";
      lines.forEach(function (line, idx) {
        if (idx) stream += "0 -" + lineHeight + " Td\n";
        stream += "(" + pdfEscape(line) + ") Tj\n";
      });
      stream += "ET\n";
      var streamId = add("<< /Length " + stream.length + " >>\nstream\n" + stream + "endstream");
      var pageId = add("<< /Type /Page /Parent " + pagesId + " 0 R /MediaBox [0 0 " + pageW + " " + pageH + "] /Resources << /Font << /F1 " + fontId + " 0 R >> >> /Contents " + streamId + " 0 R >>");
      pageIds.push(pageId);
    });
    objects[pagesId - 1] = "<< /Type /Pages /Kids [" + pageIds.map(function (id) { return id + " 0 R"; }).join(" ") + "] /Count " + pageIds.length + " >>";
    objects[catalogId - 1] = "<< /Type /Catalog /Pages " + pagesId + " 0 R >>";
    var pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", offsets = [0];
    objects.forEach(function (body, i) {
      offsets.push(pdf.length);
      pdf += (i + 1) + " 0 obj\n" + body + "\nendobj\n";
    });
    var xref = pdf.length;
    pdf += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
    for (var j = 1; j < offsets.length; j++) pdf += String(offsets[j]).padStart(10, "0") + " 00000 n \n";
    pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root " + catalogId + " 0 R >>\nstartxref\n" + xref + "\n%%EOF\n";
    return new TextEncoder().encode(pdf);
  }

  async function createPdf() {
    resetStatus();
    var text = el("textpdf-input").value;
    if (!text.trim()) { D.showError("textpdf-alert", "Please enter some text first."); return; }
    var button = el("textpdf-create");
    button.disabled = true;
    try {
      D.showInfo("textpdf-alert", "Preparing PDF…");
      var page = el("textpdf-size").value === "letter" ? [612, 792] : [595.28, 841.89];
      var margin = Number(el("textpdf-margin").value || 50);
      var fontSize = Number(el("textpdf-font-size").value || 12);
      var lineHeight = Math.max(fontSize * 1.45, 14);
      var lines = wrapLines(text, fontSize, page[0] - margin * 2);
      var perPage = Math.max(1, Math.floor((page[1] - margin * 2 - fontSize) / lineHeight) + 1);
      var pages = [];
      for (var i = 0; i < lines.length; i += perPage) pages.push(lines.slice(i, i + perPage));
      var bytes = buildPdf(pages, page[0], page[1], margin, fontSize, lineHeight);
      var blob = new Blob([bytes], { type: "application/pdf" });
      D.downloadBlob(blob, "dsutility-text-to-pdf.pdf");
      D.clearAlert("textpdf-alert");
      if (D.setProgress) D.setProgress("textpdf-progress", 100, "Done — PDF downloaded.");
      el("textpdf-progress").hidden = false;
    } catch (e) {
      console.error("[DSUTILITY] Text to PDF:", e);
      D.showError("textpdf-alert", D.humanError(e, "Could not create the PDF. Please try again."));
    } finally { button.disabled = false; }
  }
  function init() {
    el("textpdf-input").addEventListener("input", resetStatus);
    el("textpdf-create").addEventListener("click", createPdf);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

(function () {
  "use strict";

  var D = window.DSPDF;
  var state = { file: null, header: null };

  function el(id) { return document.getElementById(id); }

  function reset() {
    state = { file: null, header: null };
    var panel = el("version-panel");
    var alert = el("version-alert");
    var results = el("version-results");
    if (panel) panel.hidden = true;
    if (alert) alert.hidden = true;
    if (results) results.innerHTML = "";
  }

  /*
   * PDF files normally start with %PDF-x.y.  The PDF specification requires
   * a header, and Acrobat implementations may accept the header within the
   * first 1024 bytes. Reading only this small prefix keeps this checker fast
   * even for very large PDFs.
   */
  function readHeader(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var bytes = new Uint8Array(reader.result);
          var text = "";
          for (var i = 0; i < bytes.length; i++) {
            text += String.fromCharCode(bytes[i]);
          }

          // Accept a header at the beginning or within the first 1024 bytes.
          // Supports PDF 1.x as well as PDF 2.0.
          var match = text.match(/%PDF-(\d+)\.(\d+)/);
          if (!match) {
            reject(new Error("The selected file does not contain a readable PDF header."));
            return;
          }

          resolve({
            version: match[1] + "." + match[2],
            header: "%PDF-" + match[1] + "." + match[2]
          });
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = function () { reject(new Error("Could not read the selected file.")); };
      reader.onabort = function () { reject(new Error("Reading the selected file was cancelled.")); };
      reader.readAsArrayBuffer(file.slice(0, 1024));
    });
  }

  async function load(file) {
    reset();

    if (!file || !(file.type === "application/pdf" || /\.pdf$/i.test(file.name || ""))) {
      D.showError("version-alert", "Please choose a PDF file.");
      return;
    }

    D.showInfo("version-alert", "Reading PDF version…");

    try {
      state.file = file;
      state.header = await readHeader(file);

      var size = file.size >= 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(2) + " MB"
        : (file.size / 1024).toFixed(1) + " KB";

      el("version-results").innerHTML =
        '<div class="table-wrap"><table><tbody>' +
        '<tr><th>File</th><td>' + escapeHtml(file.name) + "</td></tr>" +
        '<tr><th>PDF version</th><td><strong>PDF ' + escapeHtml(state.header.version) + "</strong></td></tr>" +
        '<tr><th>File size</th><td>' + size + "</td></tr>" +
        '<tr><th>PDF header</th><td><code>' + escapeHtml(state.header.header) + "</code></td></tr>" +
        '</tbody></table></div>' +
        '<p class="tool-note mt-4">This result reports the version declared by the PDF header. Some PDFs can also contain a newer version in their document catalog, so this lightweight checker is not a full PDF conformance validator.</p>';

      el("version-panel").hidden = false;
      D.clearAlert("version-alert");
    } catch (e) {
      console.error("[DSUTILITY] PDF Version Checker:", e);
      D.showError("version-alert", D.humanError(e, "Could not read the PDF version. Please select a valid PDF and try again."));
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function init() {
    new D.UploadZone("#uz-version", {
      accept: "application/pdf,.pdf",
      onFiles: function (files) {
        if (files && files[0]) load(files[0]);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

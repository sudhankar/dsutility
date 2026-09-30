from pathlib import Path
from bs4 import BeautifulSoup, NavigableString
import re, json, zipfile, shutil

root=Path('/mnt/data/ds_v64_work')

# 1) Normalize blog heading/lead/article width so all blogs visually follow Merge PDF.
blog_css=root/'css'/'blog.css'
css=blog_css.read_text(errors='ignore')
css += '''\n\n/* v64: normalize every blog's heading/lead/article to the same readable column as the Merge PDF guide. */\n.blog .section > .container,\nmain.section > .container { box-sizing:border-box; }\nmain.section > .container > h1,\nmain.section > .container > .lead,\nmain.section > .container > .eyebrow,\nmain.section > .container > .article__meta,\nmain.section > .container > .article__byline { max-width:820px; width:100%; margin-left:auto; margin-right:auto; box-sizing:border-box; padding-left:20px; padding-right:20px; }\nmain.section > .container > h1 { margin-top:0; }\nmain.section > .container > .lead { margin-top:0; }\n@media (max-width:700px){\n  main.section > .container > h1, main.section > .container > .lead, main.section > .container > .eyebrow, main.section > .container > .article__meta, main.section > .container > .article__byline { padding-left:16px; padding-right:16px; }\n}\n'''
blog_css.write_text(css)

# 2) Remove SEO/guide content from PDF Editor page; keep editor UI and its guide link.
p=root/'tools'/'pdf-editor'/'index.html'
s=BeautifulSoup(p.read_text(errors='ignore'),'html.parser')
for sec in s.select('.editor-seo-content'):
    sec.decompose()
p.write_text(str(s), encoding='utf-8')

# 3) Merge duplicate visible FAQ accordions on affected tool pages.
for name in ['gratuity-calculator','marriage-biodata-maker','photo-enhancer','resume-maker']:
    p=root/'tools'/name/'index.html'; s=BeautifulSoup(p.read_text(errors='ignore'),'html.parser')
    boxes=s.select('.faq-accordion')
    if len(boxes)>1:
        first=boxes[0]
        for box in boxes[1:]:
            for child in list(box.find_all(recursive=False)):
                first.append(child.extract())
            box.decompose()
        # remove duplicate questions by normalized text
        seen=set()
        for d in list(first.find_all('details')):
            q=d.find('summary').get_text(' ',strip=True).lower()
            if q in seen: d.decompose()
            else: seen.add(q)
        p.write_text(str(s), encoding='utf-8')

# 4) Replace repeated generic FAQ sets in blog posts with topic-specific FAQs.
generic = {
    'can i keep the original pdf unchanged?',
    'why should i check the exported copy?',
    'does every pdf need the same settings?',
    'can i edit a pdf on a phone?',
    'is a visual change always a permanent content change?'
}
faq_map={
'add-image-to-pdf-guide':[
 ('Can I add more than one image to a PDF?','Yes. Add each image separately and check its position and size before exporting the final PDF.'),
 ('How should I position an image on a PDF page?','Place the image where it supports the document without covering important text, signatures or existing page elements.'),
 ('Can I resize an image after placing it?','Yes. Resize it while checking the surrounding content so the image remains readable and does not cover other information.'),
 ('Will adding an image change the original PDF?','The original source file should remain unchanged; the edited copy is the file you export and download.'),
 ('What should I check before downloading?','Review the image position, scale, page selection and exported PDF on the device where it will actually be used.')],
'add-text-to-pdf-without-reformatting':[
 ('Can I add text without changing existing PDF paragraphs?','Yes. The workflow adds new text as an overlay instead of reflowing the original PDF text.'),
 ('Where should I place new text?','Use a clear area of the page and check nearby lines, tables and signatures before exporting.'),
 ('Can I change the font size and alignment?','Yes. Choose the available text settings before placing the text, then review the final page.'),
 ('Will the original PDF be overwritten?','No. The exported document is a separate result; keep the original source if you may need to start again.'),
 ('What is the safest way to verify the result?','Open the downloaded PDF and inspect every page where text was added, especially forms and official documents.')],
'annotate-pdf-sticky-notes-stamps':[
 ('What can I annotate on a PDF?','You can add visual notes, marks, shapes or other supported annotations without rebuilding the original document.'),
 ('Are annotations permanent PDF text edits?','Not necessarily. Many annotations are added as separate visual objects rather than rewriting the original page text.'),
 ('Can I annotate only selected pages?','Yes. Work on the pages that need notes or marks and review the page list before exporting.'),
 ('Will annotations cover existing content?','They can if placed carelessly, so keep notes and marks away from important text, signatures and form fields.'),
 ('Should I review the exported PDF?','Yes. Open the saved copy and check that every annotation is visible and positioned correctly.')],
'crop-pdf-without-cutting-content':[
 ('How do I avoid cropping important content?','Check the page edges, headers, footers and tables before applying the crop. Leave enough margin for the content you need.'),
 ('Can different PDF pages need different crops?','Yes. Scanned pages, landscape pages and mixed documents may need different crop boundaries.'),
 ('Does cropping change the original file?','The exported crop is a separate result, so keep the source PDF when the original boundaries may be needed later.'),
 ('Will cropping improve printing?','It can remove unwanted margins, but always check the printable area of the target printer or portal.'),
 ('What should I check after cropping?','Open the exported PDF and inspect corners, page numbers, signatures, tables and any content close to the old edge.')],
'enhance-scanned-pdf':[
 ('What makes a scanned PDF difficult to read?','Low resolution, uneven lighting, faint text, skewed pages and compression artifacts can all reduce readability.'),
 ('Should I enhance every scanned page the same way?','Not always. A clean text page and a faded photograph may need different treatment.'),
 ('Can enhancement recover missing text?','It can improve contrast and clarity, but it cannot reliably reconstruct information that was never captured by the scan.'),
 ('Will enhancement change the original PDF?','The enhanced export is a separate result; keep the original scan for reference.'),
 ('How do I verify an enhanced scan?','Zoom into small text, signatures, numbers and diagrams before using the exported file.')],
'ocr-hindi-pdf-guide':[
 ('Does OCR work with Hindi PDF scans?','It can work well when Hindi text is clear, upright and captured at sufficient resolution.'),
 ('Why do Hindi OCR results contain mistakes?','Complex layouts, low-quality scans, unusual fonts and mixed Hindi-English text can reduce recognition accuracy.'),
 ('Should I OCR the whole PDF at once?','For important documents, test a representative page first and verify names, numbers and official terms before processing everything.'),
 ('Can OCR preserve the original page layout?','OCR primarily extracts recognized text; the exact visual layout depends on the tool and output format.'),
 ('How should I check OCR accuracy?','Compare the extracted text against the scan, especially dates, names, amounts, punctuation and Hindi matras.')],
'page-numbers-pdf-layout':[
 ('Where should PDF page numbers be placed?','Choose a position that remains visible without covering existing text, signatures, tables or footers.'),
 ('Can I start numbering from a specific page?','That depends on the numbering controls available in the tool; check the preview before exporting.'),
 ('Can I change the number format?','Use the available prefix, position and formatting options, then inspect a few pages before creating the final PDF.'),
 ('Will page numbers change the original PDF?','The numbered PDF is an exported copy; keep the original if you may need an unnumbered version.'),
 ('What should I check before sharing a numbered PDF?','Check the first, middle and final pages for placement, sequence and overlap with existing content.')],
'pdf-editor-shapes-arrows-lines':[
 ('Can I add arrows and shapes to a PDF?','Yes. The guide covers visual objects such as lines, arrows, boxes and highlights placed over existing PDF pages.'),
 ('Can I move an annotation after placing it?','Use the editor selection controls to select and reposition supported objects before exporting.'),
 ('Are these annotations secure redactions?','No. A visual box or highlight should not be treated as permanent removal of underlying PDF data.'),
 ('Can I use the editor on large PDFs?','Browser memory and rendering time become important as page count and image content increase.'),
 ('Should I verify the exported PDF?','Yes. Open the saved file and inspect the pages where annotations were added.')],
'pdf-eraser-vs-redaction':[
 ('Is drawing a white box over text secure redaction?','No. A visual overlay can leave the original text underneath. Secure redaction requires actual removal of the underlying data.'),
 ('When should I use a redaction workflow?','Use proper redaction when confidential information must be permanently removed before a document is shared.'),
 ('Can an erased-looking PDF still contain the hidden text?','Yes. If the original content remains underneath an overlay, it may still be recoverable or selectable.'),
 ('Should I remove metadata too?','For sensitive documents, metadata should be reviewed separately because it can contain information not visible on the page.'),
 ('How can I verify a redaction?','Test the exported PDF by selecting/searching text and inspecting the file with an appropriate PDF viewer or redaction verification workflow.')],
'pdf-metadata-before-sharing':[
 ('What PDF metadata should I check before sharing?','Review fields such as author, title, subject, creator, producer and other document properties that may reveal unwanted information.'),
 ('Can metadata reveal personal information?','Yes. Metadata can contain names, software details or document history that is not visible on the page.'),
 ('Does removing metadata change the visible PDF?','Usually the visible page content remains the same, while document properties are changed.'),
 ('Should I check metadata on every sensitive PDF?','It is a useful final check when a document contains confidential, personal or internal information.'),
 ('Can metadata removal replace redaction?','No. Metadata cleanup and content redaction solve different problems and should not be treated as interchangeable.')],
'pdf-preview-dpi-quality':[
 ('Why does a PDF preview look blurry?','A preview may use a lower rendering resolution than the original page, especially when zoomed or when a large page is being rendered.'),
 ('What does DPI change in a PDF image preview?','Higher rendering resolution can show more detail, but it also increases memory and processing requirements.'),
 ('Does a blurry preview mean the PDF is low quality?','Not always. Check the original PDF or export before concluding that the source content is degraded.'),
 ('What DPI should I use for image-heavy pages?','Choose a resolution appropriate to the intended use; printing generally needs more detail than a small on-screen preview.'),
 ('How can I verify final quality?','Open the exported file at normal and high zoom and inspect small text, diagrams and images.')],
'reorder-delete-extract-pdf-pages':[
 ('What is the difference between reorder, delete and extract?','Reorder changes page sequence, delete removes pages from the result, and extract creates a new PDF from selected pages.'),
 ('Can I keep the original PDF unchanged?','Yes. Work from the source and export a new result so the original remains available if you need it.'),
 ('Can I combine page operations in one workflow?','Yes, when the tool supports the operations together. Review the final page sequence before export.'),
 ('How do I avoid deleting the wrong page?','Use page thumbnails, page numbers and a final sequence check before downloading.'),
 ('Should I open the exported PDF?','Yes. Confirm that the intended pages are present, ordered correctly and not accidentally removed.')],
'watermark-vs-stamp-pdf':[
 ('What is the difference between a watermark and a stamp?','A watermark is usually a lighter, document-wide visual mark, while a stamp is often a stronger label placed at a specific position.'),
 ('What opacity should a watermark use?','Use enough transparency to keep the underlying document readable while making the watermark visible.'),
 ('Can a watermark cover important content?','Yes, if positioned poorly. Preview the result and keep the mark away from signatures, numbers and critical text.'),
 ('Will a watermark protect a PDF from copying?','It can identify or discourage misuse, but it is not a technical copy-protection mechanism.'),
 ('Should I keep an unwatermarked original?','Yes. Keep the clean source so you can create a different watermark version later.')],
}

# Additional mappings for calculator/other blogs with no FAQ or generic FAQ.
faq_map.update({
'background-remover-guide':[
 ('How does browser-based background removal work?','The tool analyzes image edges and removes pixels that match the selected background range. Results depend on contrast and image complexity.'),
 ('Why do hair and fine edges need extra checking?','Fine details can have colors similar to the background, so automatic removal may also affect them.'),
 ('Can I control how much background is removed?','Use the available tolerance and related controls to balance background removal against preserving the subject.'),
 ('What images work best?','Images with clear subject-background contrast generally produce cleaner results than busy or similarly colored backgrounds.'),
 ('Should I check the transparent result before downloading?','Yes. Inspect hair, clothing edges, shadows and small details on a contrasting background.')],
'collage-maker-guide':[
 ('How many photos can I place in a collage?','The available layout determines how many cells can be used; choose a layout that fits the number of photos without making each image too small.'),
 ('Can I change the spacing between photos?','Use the collage controls for frame or spacing where available, then preview the complete composition.'),
 ('Can I shuffle photos between collage cells?','Yes, the advanced collage workflow supports rearranging the selected images without starting the whole design again.'),
 ('What export quality should I choose?','Choose JPEG quality according to whether the collage is intended for screen sharing, printing or further editing.'),
 ('Will the collage preserve the original photos?','The collage is a new composite image; your source photos remain separate files on your device.')],
'image-resize-compress-guide':[
 ('Should I resize before compressing an image?','Usually yes when the image is much larger than its intended display size, because reducing dimensions can save more space than compression alone.'),
 ('What is the difference between resize and compress?','Resize changes pixel dimensions, while compression reduces file size by encoding the image more efficiently.'),
 ('Can I target a specific file size?','Use the available size target where supported, then verify the downloaded file because exact size depends on image content and format.'),
 ('Which format should I use?','JPEG is often practical for photographs, while PNG can be preferable for transparency or graphics with sharp edges.'),
 ('How do I avoid excessive quality loss?','Reduce dimensions and quality gradually and compare the result at the actual size where it will be used.')],
'image-to-text-ocr-guide':[
 ('What image quality is best for OCR?','Use a sharp, well-lit image with enough resolution for small characters to remain distinct.'),
 ('Can Image to Text OCR read Hindi?','It can when the recognition engine and source image support the language and the text is clear.'),
 ('Why are some characters recognized incorrectly?','Blur, skew, unusual fonts, low contrast and complex backgrounds can cause recognition errors.'),
 ('Can OCR read handwriting reliably?','Handwriting is substantially harder than clear printed text and results depend heavily on the writing style and recognition engine.'),
 ('How should I verify OCR output?','Compare names, numbers, dates and punctuation with the original image before using the extracted text.')],
'krutidev-unicode-converter-guide':[
 ('When should I convert Krutidev to Unicode?','Use Krutidev-to-Unicode when legacy Hindi text needs to move into modern Unicode applications and workflows.'),
 ('When is Unicode-to-Krutidev useful?','Use the reverse direction only when an older application or workflow specifically requires Krutidev text.'),
 ('Why can converted Hindi look wrong?','A wrong conversion direction or text that was not actually Krutidev can produce unreadable output.'),
 ('Can I convert an image with this tool?','No. A screenshot or scanned page needs OCR first because a text converter works on characters, not image pixels.'),
 ('How should I verify a conversion?','Check names, dates, numbers, punctuation and a representative paragraph in the application where the converted text will be used.')],
'fd-calculator-guide':[
 ('What does an FD calculator estimate?','It estimates maturity value and interest from the principal, rate, tenure and compounding assumptions entered by the user.'),
 ('Why can bank maturity values differ slightly?','Banks may use different compounding conventions, day-count rules or product-specific terms.'),
 ('What is interest earned?','It is the estimated maturity amount minus the principal invested under the selected assumptions.'),
 ('Does the calculator account for taxes?','A simple maturity calculation may not represent every tax or TDS situation; check the actual bank product terms.'),
 ('Should I treat the result as a guaranteed bank quote?','No. Use it as an estimate and confirm the final maturity terms with the institution offering the deposit.')],
'gpf-calculator-guide':[
 ('What does a GPF statement calculator show?','It can organize monthly subscriptions, credits, withdrawals, interest and the resulting balance according to the inputs provided.'),
 ('Why should I verify the interest rate?','GPF rates can change by period, so the applicable rate must match the relevant financial year or period.'),
 ('Can I use the calculator for an official statement?','It is a calculation aid. Verify the result against the department or treasury record before treating it as an official statement.'),
 ('What should I check in a GPF calculation?','Check monthly entries, withdrawals, interest periods and the opening balance before exporting the statement.'),
 ('Can I print the GPF statement?','Yes. Review the calculated rows and totals before using the print or PDF output.')],
'da-arrears-calculator-guide':[
 ('What does a DA arrears calculation require?','It generally needs the relevant pay, old and revised DA rates, effective periods and any applicable deductions or adjustments.'),
 ('Why do month boundaries matter?','The old and revised rates may apply to different periods, so each month needs the correct rate and number of days or applicable period.'),
 ('Can deductions change the final arrears?','Yes. Gross arrears and the amount after selected deductions are different figures and should be checked separately.'),
 ('Can I print the DA arrears statement?','Yes. Review the month-wise calculation and totals before printing or saving the statement as PDF.'),
 ('Is the calculator an official government statement?','No. It is a calculation aid. Confirm the final amount against the applicable department rules and official records.')],
'nps-calculator-guide':[
 ('What does an NPS calculator estimate?','It estimates the potential retirement corpus or related values from the contribution, return assumption, tenure and other inputs.'),
 ('Why is the return assumption important?','The estimated corpus changes significantly when the assumed rate of return changes.'),
 ('Is the calculated NPS corpus guaranteed?','No. It is an estimate based on the assumptions entered and actual investment performance can differ.'),
 ('Should I include employer contributions?','Include them only when the calculator fields and your calculation scenario are intended to account for them.'),
 ('How should I use the result?','Compare scenarios rather than treating one estimate as a guaranteed retirement outcome.')],
'gratuity-calculator-guide':[
 ('What inputs are used for a gratuity estimate?','The calculation generally depends on eligible service period and the applicable salary components and rules used by the relevant employment framework.'),
 ('Is the calculator an official gratuity statement?','No. It is an estimate and should be checked against the applicable rules and employer records.'),
 ('Why can gratuity results differ between calculators?','Different tools may apply different assumptions about eligible service, salary components or rounding.'),
 ('Does every employee follow the same gratuity rules?','Not necessarily. The applicable employment arrangement and legal rules should be checked for the specific case.'),
 ('Should I verify the final amount?','Yes. Use the calculator for estimation and confirm the final payable amount through the appropriate official or employer source.')],
'leave-encashment-calculator-guide':[
 ('What does leave encashment estimate?','It estimates the value of eligible unused leave using the salary components and leave balance entered by the user.'),
 ('Why can leave encashment rules differ?','Eligibility, salary components, maximum leave limits and calculation rules can depend on the applicable service or employment framework.'),
 ('Should I include allowances?','Only include salary components that are actually part of the applicable leave-encashment rule for your case.'),
 ('Can I use the result as an official claim amount?','No. Treat it as an estimate until verified against the applicable records and rules.'),
 ('What should I check before printing the calculation?','Check leave balance, salary inputs, applicable limits and the final estimated amount.')],
'marriage-biodata-maker-guide':[
 ('Can I choose a biodata design?','Yes. The maker provides multiple layout and border options so the final biodata can match the intended style.'),
 ('Can I add a religion-related emblem?','The maker provides optional emblem choices that can be selected when they are appropriate for the user’s biodata design.'),
 ('Can I add a candidate photo?','Yes. Place the photo in the designated area and check the print preview before exporting.'),
 ('Will the website header appear in the saved PDF?','The export is designed to capture the biodata document rather than the surrounding website interface.'),
 ('Can I edit the biodata after saving?','Yes. Keep the editable version or return to the maker, make changes and export a new copy.')],
'passport-photo-guide':[
 ('What size should a passport-style photo be?','The required dimensions depend on the country, application or institution. Use the exact specification given by the authority requesting the photo.'),
 ('Can I create multiple copies on one sheet?','Yes, when the tool provides sheet or ID-photo layouts, arrange the required number of copies and check the print dimensions.'),
 ('Why does file size matter?','Online forms often impose maximum file-size limits, so the image may need both correct dimensions and controlled compression.'),
 ('Can I use a background-removed photo?','Only when the destination application permits it. Some applications require a specific plain background.'),
 ('How should I verify the final photo?','Check dimensions, file size, face visibility, background and the authority’s exact photo specification before uploading.')],
'photo-enhancer-guide':[
 ('What does a photo enhancer change?','Enhancement can adjust contrast, brightness, sharpness or related image properties to improve the appearance of the photo.'),
 ('Can enhancement restore a very blurry photo?','It can improve perceived clarity, but it cannot reliably recreate details that were never captured.'),
 ('Can I revert to the original image?','Yes. Keep the original as the baseline and use the reset or revert control before exporting another version.'),
 ('Does enhancement upload my photo?','For browser-based processing, the image can be processed locally; check the tool’s current privacy notice and browser behavior.'),
 ('What should I compare before saving?','Compare the enhanced image with the original at the actual size where it will be used to avoid over-sharpening or excessive contrast.')],
'resume-maker-guide':[
 ('Can I add multiple experience entries?','Yes. Add the experience sections needed for the candidate and keep the final resume concise and relevant.'),
 ('Can I change section titles?','Use the maker’s editable fields or controls where available to adapt the resume to the candidate’s profile.'),
 ('Will the website header appear in the PDF?','The PDF export is intended to contain the resume document rather than the surrounding website page.'),
 ('Can I create more than one resume version?','Yes. Save or export separate versions for different roles when the emphasis needs to change.'),
 ('What should I check before downloading?','Review dates, contact details, section order, spelling, page breaks and the final PDF appearance.')],
'sip-calculator-guide':[
 ('What does the SIP calculator estimate?','It estimates the future value of periodic investments using the contribution, expected return and investment period entered by the user.'),
 ('Can I compare SIP with a lumpsum investment?','Yes. A lumpsum scenario uses a single initial investment, while SIP models repeated periodic contributions.'),
 ('Is the return guaranteed?','No. The calculator uses an assumed return rate; actual investment performance can be different.'),
 ('What does total invested mean?','It is the total of the actual contributions entered for the selected investment period.'),
 ('Why can different calculators show different results?','Compounding conventions, contribution timing and rounding can produce different estimates.')],
'swp-calculator-guide':[
 ('What does an SWP calculator estimate?','It estimates withdrawals and the remaining balance from an initial corpus, withdrawal amount, frequency, return assumption and period.'),
 ('What is total withdrawal?','It is the cumulative amount withdrawn during the selected period, based on the withdrawal schedule.'),
 ('Is SWP income guaranteed?','No. The result depends on the assumed return and withdrawal pattern, while actual investment returns vary.'),
 ('Why can the remaining corpus become low?','Withdrawals can exceed investment growth for a period, reducing the balance over time.'),
 ('Why can two SWP calculators differ?','They may use different compounding periods, withdrawal timing, rate conversions or rounding methods.')],
'rd-calculator-guide':[
 ('What does an RD calculator estimate?','It estimates maturity value and interest from recurring deposits, the applicable rate, tenure and compounding assumptions.'),
 ('What does total invested mean in an RD calculation?','It is the sum of all recurring deposit instalments made during the selected tenure.'),
 ('Why is estimated interest separate from maturity value?','Maturity value includes the invested principal plus the interest earned; estimated interest is only the growth component.'),
 ('Can bank RD maturity values differ?','Yes. Banks can use product-specific compounding, deposit dates and calculation conventions.'),
 ('Should I treat the result as an official bank quote?','No. Confirm the actual maturity terms with the bank or financial institution.')],
})

for slug, items in faq_map.items():
    p=root/'blog'/slug/'index.html'
    if not p.exists(): continue
    s=BeautifulSoup(p.read_text(errors='ignore'),'html.parser')
    boxes=s.select('.faq-accordion')
    if not boxes: continue
    # merge multiple boxes first
    box=boxes[0]
    for b in boxes[1:]:
        for child in list(b.find_all(recursive=False)): box.append(child.extract())
        b.decompose()
    # If this is the repeated generic FAQ, replace its details entirely.
    qs=[d.find('summary').get_text(' ',strip=True).lower() for d in box.find_all('details')]
    if len(set(qs)&generic)>=3 or slug in faq_map:
        box.clear()
        for q,a in items:
            d=s.new_tag('details')
            sm=s.new_tag('summary'); sm.string=q
            pp=s.new_tag('p'); pp.string=a
            d.append(sm); d.append(pp); box.append(d)
    # Ensure exactly one visible FAQ heading before the accordion when none exists.
    prev=box.find_previous_sibling()
    if not prev or prev.name not in ['h2','h3'] or prev.get_text(' ',strip=True).lower() not in {'faq','frequently asked questions'}:
        h=s.new_tag('h2'); h.string='FAQ'; box.insert_before(h)
    p.write_text(str(s), encoding='utf-8')

# 5) Remove any duplicate visible FAQ headings/accordions in all tools: keep first accordion and merge details.
for p in root.glob('tools/*/index.html'):
    s=BeautifulSoup(p.read_text(errors='ignore'),'html.parser')
    boxes=s.select('.faq-accordion')
    if len(boxes)>1:
        first=boxes[0]
        for b in boxes[1:]:
            for child in list(b.find_all(recursive=False)): first.append(child.extract())
            b.decompose()
        seen=set()
        for d in list(first.find_all('details')):
            q=d.find('summary').get_text(' ',strip=True).lower()
            if q in seen: d.decompose()
            else: seen.add(q)
        p.write_text(str(s), encoding='utf-8')

# Version/cache markers
for p in [root/'service-worker.js']:
    if p.exists():
        t=p.read_text(errors='ignore')
        t=re.sub(r'(CACHE_NAME\s*=\s*[\'\"][^\'\"]*?)-v\d+', r'\1-v64', t)
        t=t.replace('DSUTILITY-v63','DSUTILITY-v64')
        p.write_text(t)

# Report
report=root/'AUDIT-REPORT-v64.txt'
report.write_text('''DSUTILITY v64 Regression Fix Report\n\n1. Blog headings/lead/article content normalized to a consistent 820px readable column matching the Merge PDF guide.\n2. PDF Editor: removed the long SEO/guide content block beneath the canvas; the editor page now points users to the dedicated PDF Editor Guide.\n3. Duplicate visible FAQ accordions merged on affected tool pages and duplicate questions removed.\n4. Repeated generic blog FAQ set replaced with tool/topic-specific questions and answers across affected guides.\n5. FAQ heading is ensured before visible FAQ accordions where needed.\n6. PDF Editor core implementation preserved from v59/v63 restoration.\n''', encoding='utf-8')

# Static checks
htmls=list(root.rglob('*.html'))
print('HTML',len(htmls))
print('blog css bytes',len(css))
print('remaining duplicate tool FAQ pages:')
for p in sorted(root.glob('tools/*/index.html')):
    ss=BeautifulSoup(p.read_text(errors='ignore'),'html.parser')
    if len(ss.select('.faq-accordion'))>1: print(' ',p)
print('remaining generic blog FAQ pages:')
for p in sorted(root.glob('blog/*/index.html')):
    ss=BeautifulSoup(p.read_text(errors='ignore'),'html.parser')
    qs={d.find('summary').get_text(' ',strip=True).lower() for d in ss.select('.faq-accordion details')}
    if len(qs&generic)>=3: print(' ',p.parent.name)

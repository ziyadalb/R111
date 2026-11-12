#!/usr/bin/env python3
"""يستبدل فهرس الـ PDF الجانبي (Bookmarks) بعناوين عربية صحيحة.
Chromium يكتب عناوين الـ outline العربية بترتيب كلمات مقلوب، فنكتبها من جديد بـ pypdf.
الاستخدام: python3 build/outline.py file.pdf outline.json
"""
import json
import sys

from pypdf import PdfReader, PdfWriter

pdf_path, json_path = sys.argv[1], sys.argv[2]
items = json.load(open(json_path, encoding='utf-8'))
reader = PdfReader(pdf_path)
writer = PdfWriter(clone_from=reader)
root = writer._root_object
if '/Outlines' in root:
    del root['/Outlines']
writer._root_object.update({})
parent = None
for it in items:
    page_index = int(it['page']) - 1
    if it['level'] == 1:
        parent = writer.add_outline_item(it['title'], page_index)
    else:
        writer.add_outline_item(it['title'], page_index, parent=parent)
writer.page_mode = '/UseOutlines'
with open(pdf_path, 'wb') as fh:
    writer.write(fh)
print(f'outline: {len(items)} عنصر')

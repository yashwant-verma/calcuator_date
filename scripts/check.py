from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,unquote
import json

ROOT=Path(__file__).resolve().parent.parent/'dist'
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.refs=[];self.ids=[];self.h1=0;self.title='';self.in_title=False;self.metas={};self.lang='';self.labels=[];self.inputs=[];self.canonical='';self.jsons=[];self.in_json=False;self.script=''
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='html':self.lang=a.get('lang')
        if tag=='h1':self.h1+=1
        if tag=='title':self.in_title=True
        if tag=='meta':self.metas[a.get('name',a.get('property',''))]=a.get('content','')
        if tag=='link' and a.get('rel')=='canonical':self.canonical=a.get('href','')
        if tag=='label':self.labels.append(a.get('for'))
        if tag in ['input','select']:self.inputs.append(a.get('id'))
        if tag=='script' and a.get('type')=='application/ld+json':self.in_json=True;self.script=''
        for attr in ['href','src']:
            if a.get(attr):self.refs.append(a[attr])
    def handle_endtag(self,tag):
        if tag=='title':self.in_title=False
        if tag=='script' and self.in_json:self.jsons.append(json.loads(self.script));self.in_json=False
    def handle_data(self,data):
        if self.in_title:self.title+=data
        if self.in_json:self.script+=data

files=list(ROOT.rglob('*.html'));titles=[];canonical_count=0
for file in files:
    p=Page();p.feed(file.read_text());relative=file.relative_to(ROOT).as_posix()
    assert p.h1==1,(relative,'h1')
    assert p.lang==('hi' if relative.startswith('hi/') else 'en'),relative
    assert p.metas.get('description') and p.metas.get('viewport'),relative
    assert len(p.ids)==len(set(p.ids)),(relative,'duplicate ids')
    assert all(i in p.labels for i in p.inputs),(relative,'unlabelled form')
    assert p.jsons,(relative,'structured data')
    if not relative.endswith('404.html'):titles.append(p.title)
    base=''
    if p.canonical:
        canonical_count+=1
        pagepath=relative.removesuffix('index.html')
        parsed=urlparse(p.canonical)
        base=parsed.path[:-len(pagepath)].rstrip('/') if pagepath else parsed.path.rstrip('/')
    elif relative.endswith('404.html'):
        # Infer the base from a generated stylesheet URL.
        css=next(r for r in p.refs if r.endswith('/style.css'));base=css.removesuffix('/style.css')
    for ref in p.refs:
        u=urlparse(ref)
        if u.scheme or u.netloc:continue
        if not u.path:
            if u.fragment:assert unquote(u.fragment) in p.ids,(relative,ref)
            continue
        target=u.path
        if base and target.startswith(base+'/'):target=target[len(base):]
        dest=ROOT/target.lstrip('/')
        if target.endswith('/'):dest=dest/'index.html'
        assert dest.exists(),(relative,ref,'missing local asset/route')
        if u.fragment and dest.suffix=='.html':
            q=Page();q.feed(dest.read_text());assert u.fragment in q.ids,(relative,ref,'missing anchor')
assert len(titles)==len(set(titles)),'duplicate page titles'
assert len(files)==18,('route count',len(files))
assert (ROOT/'app.mjs').stat().st_size<20000
assert (ROOT/'style.css').stat().st_size<20000
print(f'PASS: {len(files)} pages, links/anchors, labels, JSON-LD, languages and unique titles. {canonical_count} canonical URLs.')

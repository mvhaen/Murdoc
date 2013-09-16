# Murdoc

Murdoc is a lightweight publishing framework where you write in Markdown and can export to multiple formats. I wrote it primarily as a tool for writing technical documentation that I could then publish as a site and as a PDF.

The output can be styled but for this you'll need some expertise in HTML, CSS and LaTex.

## Features

 - Write everything in [Kramdown](http://kramdown.rubyforge.org), a superset of Markdown.
 - Simple folder-based structure. Murdoc takes care of stitching everything together. Anyone familiar with [daux.io](http://daux.io) should feel right at home.
 - Wiki-style links based on [kramdowns automatic generation of header IDs](http://kramdown.rubyforge.org/converter/html.html#auto-ids).
 - Output to multiple formats:
 	- static HTML using [Jekyll](http://jekyllrb.com)
 	- PDF (using LaTeX). 
 	- ePub support will be available in the near future.
 - Templates: customize each output format by providing your own HTML, CSS or LaTeX code.
 - Built-in webserver using [express](express.js).
 - Built-in folder watching using [chokidar](https://github.com/paulmillr/chokidar): any changes made to the documentation or the templates will automatically re-build the outputs.


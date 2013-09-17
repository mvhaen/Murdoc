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

# Installation

Murdoc is available through [npm](http://npmjs.org).

 > npm install -g murdoc

## Dependencies

Make sure the following tools are also installed:

 - [Jekyll](http://jekyllrb.com) (<http://jekyllrb.com>)
 - [Kramdown](http://kramdown.rubyforge.org) (<http://kramdown.rubyforge.org>)
 - LaTeX: Murdoc uses the 
   - On a Mac you will need to install [MacTeX](http://tug.org/mactex/) (<http://tug.org/mactex/>).
   - On Linux, you will need to install it from your distro's packages. You will also need to install some additional dependencies like graphicx, listings, inputenc.

# Getting Started

Create a new Murdoc project and publish it to html.

 > murdoc --create folder-name --watch --server --output=html

Next direct your browser to <http://localhost:4000> and you will see the Murdoc documentation. The next time you want to work on a project you can use:

 > murdoc --docs folder-name --watch --server --output=html

In 'folder-name' you will now find three folders:

 - **docs:** the content of your document. We've already put the documentation for Murdoc here, so you have a good example to start from.
 - **build:** any build output is found here. The static sites end up in build/jekyll/_site. The PDF is written to build/latex/main.pdf.
 - **templates:** When creating the project we copied in our default templates. Feel free to modify them to your needs, that's what they are there for.



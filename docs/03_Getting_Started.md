# Getting Started

Create a new Murdoc project and publish it to html.

 > murdoc --create folder-name --watch --server --output=html

Next direct your browser to <http://localhost:4000> and you will see the Murdoc documentation. The next time you want to work on a project you can use:

 > murdoc --docs folder-name --watch --server --output=html

In 'folder-name' you will now find three folders:

 - **docs:** the content of your document. We've already put the documentation for Murdoc here, so you have a good example to start from.
 - **build:** any build output is found here. The static sites end up in build/jekyll/_site. The PDF is written to build/latex/main.pdf.
 - **templates:** When creating the project we copied in our default templates. Feel free to modify them to your needs, that's what they are there for.



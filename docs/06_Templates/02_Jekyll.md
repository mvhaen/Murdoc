# Jekyll

Murdoc uses [Jekyll](http://jekyllrb.com) to generate a static HTML site. Your documentation's files and folders will automatically be copied into a Jekyll environment and where needed the necessary YAML front-matter is inserted.

You can modify both the HTML and CSS of the default template to your liking. A little understanding of Jekyll and Liquid templates is helpful but not absolutely necessary. The most important files you'll want to edit are:

 - **_config.yml:** change the 'name' setting to alter the title of the site. Please leave the 'markdown'-setting set to markdown. Any other parsers might give issues.
 - **_layouts/default.html:** the template used to generate the site. Modify it if you want to change the layout of the site. Make sure not to modify the code for the table-of-contents if you don't understand liquid templates.
 - **main/main.css:** The main CSS file.
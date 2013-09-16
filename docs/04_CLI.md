# CLI

 - **-d, --docs**
   - give a Murdoc project folder.
   - *default: expects the project to in the present working directory.*
 - **-w, --watch**
   - Watch for changes in the 'docs' and 'templates' folders an re-build the project when necessary.
   - *default: not enabled.*
 - **-s, --serve**
   - Start a local HTTP server to watch the HTML output on <http://localhost:4000>. Won't start if html output is not enabled.
   - *default: node enabled.*
 - **-p, --prefix**
   - Useful if the target HTML output will not be served in the webroot. In this case you can't use the --serve option to watch the output.
   - *default: empty*
 - **-o, --output**
   - Choose which output formats are to be generated. Give a comma-seperated string of the keywords: html, pdf. The order is not important.
   - *default: html,pdf*
 - **-h, --help**
   - Shows the available options


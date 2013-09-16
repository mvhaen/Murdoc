# Folder Structure

## Naming Convention

Files and folders are searched in alphabetical order in the /docs folder. Only Markdown *.md files inside the /docs folder and any of the subfolders will be processed. Names should not contains any spaces, so words *must* be separated by underscores. Note that we use the same naming conventions as [daux.io](http://daux.io).

Here are some example file names and what they will be converted to:

 - **Good:**
    - 01_Getting_Started.md = Getting Started
    - API_Calls.md = API Calls
    - 200_Something_Else-Cool.md = Something Else-Cool
 - **Bad:**
    - File Name With Space.md = FAIL

## Sorting

Use a numeric prefix followed by an underscore to force Murdoc to parse files and folders in the right order. e.g. 01_Getting_Started.md will get parsed before 04_Another_Example.md. The prefixes are removed when generating the output.

## Hierarchy

With Murdoc you can write text, add sections and subsections and you don't need to worry about where the content will be in relation to the other files. Just write everything starting with a first-level header and continue from there and depending in on the ouput that is generated, murdoc will offset headers to move them to a logical position.

*Note: the only restriction on this is, that you can only nest 5 levels deep. This is a limitation of markdown.*

### Static HTML

When exporting to a static HTML site, the first file or folder is used as index page. In the case of a folder, an empty index page is created, containing only the title, which is derived from the folder-name.

### PDF

When exporting to PDF the first document of a folder is used on the same level of hierarchy as any files on the same level as the folder. 

So take the following example:

	01_About.md
	02_Installation.md
	...
	05_Writing_Documents/01_index.md
	05_Writing_Documents/02_Folder_Structure.md
	...

The files 01_About.md and 02_Installation.md, will both have a first level header that will be translated to a first level header in the final document. The same goes for 05_Writing_Documents/01_index.md, but for 05_Writing_Documents/02_Folder_Structure.md the header levels will be moved 1 down.

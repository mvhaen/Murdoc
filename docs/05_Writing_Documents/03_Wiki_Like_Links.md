# Wiki-like Links

Using the automatic generation of header IDs available through kramdown and reference-style links in the Markdown syntax, Murdoc allows for easy wiki-like links. 

e.g. take the following headers

~~~~
# This is a header

## 12. Another one 1 here
~~~~

Anywhere else in the project you can now link to these sections using reference-style links.

~~~~
This [link points to the first paragraph][this-is-a-header] and [this one][another-one-1-here] will point to to the second.
~~~~

## Reference-style links

Markdown's reference-style links use a second set of square brackets, inside which you place a label of your choosing to identify the link:

	This is [an example][id] reference-style link.

You can optionally use a space to separate the sets of brackets:

	This is [an example] [id] reference-style link.

Murdoc will take care of creating a correct reference index file for the selected output and will include it whenever markdown is converted.

## Kramdown auto-id's

As can be found in the [Kramdown documentation](http://kramdown.rubyforge.org/converter/html.html#auto-ids), it supports the automatic generation of header IDs if the option auto_ids is set to true (which is the default). This is done by converting the untransformed, i.e. plain, header text via the following steps:

 - All characters except letters, numbers, spaces and dashes are removed.
 - All characters from the start of the line until the first letter are removed.
 - Everything except letters and numbers is converted to dashes.
 - Everything is lowercased.
 - If nothing is left, the identifier section is used.
 - If a such created identifier already exists, a dash and a sequential number is added (first -1, then -2 and so on).

Following are some examples of header texts and their respective generated IDs:

~~~~
# This is a header
auto_id: this-is-a-header

## 12. Another one 1 here
auto_id: another-one-1-here

### Do ^& it now
auto_id: do--it-now

Hallo
=====
auto_id: hallo

Not now
-------
auto_id: not-now

# Hallo
auto_id: hallo-1

# 123456789
auto_id: section
~~~~

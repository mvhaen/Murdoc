#!/usr/bin/env node

var cheerio = require('cheerio');
var fs = require('fs-extra');
var temp = require('temp');
var sh = require('execSync');
var yaml = require('js-yaml');
var wrench = require('wrench');
var util = require('util');
var chokidar = require('chokidar');
var path = require('path');
var optimist = require('optimist');

var argv = optimist
    .options('d', {
        alias : 'docs',
        default: "."
    })
    .options('w', {
    	alias: 'watch',
    	default: false
    })
    .options('s', {
    	alias: 'serve',
    	default: false
    })
    .options('p', {
    	alias: 'prefix',
    	default: ""
    })
    .options('o', {
    	alias: 'output',
    	default: 'html,pdf'
    })
    .options('c', {
    	alias: 'create'
    })
    .options('h', {
    	alias: 'help',
    	default: false
    })
	.options('x', {
    	alias: 'image-prefix',
    	default: "/images"
    })
	.options('t', {
    	alias: 'latex-image-width',
    	default: "\maxwidth"
    })
    .argv
;

if (argv.h) {
	console.log(optimist.help());
	process.exit(0)
}

var source = path.resolve(argv.d + "/docs");
var tmp = temp.mkdirSync('murdoc');
var tpl = path.resolve(argv.d+"/templates");
var jekyll_tpl = path.resolve(argv.d+"/templates/jekyll");
var latex_tpl = path.resolve(argv.d+"/templates/latex");
var build = path.resolve(argv.d+"/build");
var jekyll_out = path.resolve(argv.d+"/build/jekyll");
var latex_out = path.resolve(argv.d+"/build/latex");
var image_prefix = argv.x;
var latex_image_width = argv.t;
var www_prefix = argv.p;

var build_pdf = false;
var build_html = false;
if (argv.o.indexOf('pdf') !== -1 ) {
	build_pdf = true;
}
if (argv.o.indexOf('html') !== -1 ) {
	build_html = true;
}

var express = require('express');
var app = express();

if (argv.c) {
	if (fs.existsSync(source) || fs.existsSync(tpl)) {
		console.log("Another project is at '" + path.resolve(argv.d) + "'. Refusing to create a project.");
		process.exit(0);
	}
	if (!fs.existsSync(argv.d)) {
		fs.mkdirSync(argv.d);
	}
	if (!fs.existsSync(build)) {
		fs.mkdirSync(build);
	}
	wrench.copyDirSyncRecursive(__dirname+"/docs", argv.d+"/docs");
	wrench.copyDirSyncRecursive(__dirname+"/templates", argv.d+"/templates/");
}

function PrecursorList(section, precursors) {

	this._init = function () {
		this.sections = new Array();
		this.section = section;
		this.precursors = precursors;

		if (this.precursors !== undefined) {
			this.sections = this.precursors.sections.slice(0);
		}
		if (this.section !== undefined) {
			this.sections.push(this.section);
		}	
	}

	this.sourcePath = function () {
		var ret = "/";
		for (var i = 0; i < this.sections.length; i++) {
			if (this.sections[i].source !== "") {
				ret += this.sections[i].source+"/";
			}
		}
		return ret;
	}

	this.targetPath = function() {
		var ret = "/";
		for (var i = 0; i < this.sections.length; i++) {
			if (this.sections[i].target !== "") {
				ret += this.sections[i].target+"/";
			}
		}
		return ret;
	}

	this._init();
}

function Section(name, precursors) {
	this._init = function() {
		this.source = name;
		this.precursors = precursors;

		if (this.precursors == undefined) {
			this.precursors = new PrecursorList();
		}
		var title = this.source.replace(".md", "");
		var split = title.split("_");
		if (split[0].match(/^\d+$/)) {
			split.splice(0, 1);
		}
		this.title = split.join(" ");
		this.target = split.join("_");
		this.stats = fs.statSync(this.sourcePath());
		if (this.isDirectory()) {
			this.contents = fs.readdirSync(this.sourcePath());
		}

	}

	this.isDirectory = function() {
		return this.stats.isDirectory();
	}

	this.sourcePath = function () {
		return source + this.precursors.sourcePath() + this.source;
	}

	this.targetPath = function() {
		return jekyll_out + this.precursors.targetPath() + this.target;
	}

	this.breadcrumb = function() {
		if (this.source == "") {
			return "<a href=\""+www_prefix+"/\"><i class=\"icon-home\"></i></a>";
		}
		return "[" + this.title + "][_nav-" + this.target+"]";
	}

	this.breadcrumbs = function() {
		var ret = "";
		for (var i = 0; i < this.precursors.sections.length; i++) {
			ret += this.precursors.sections[i].breadcrumb() + " <i class=\"icon-angle-right\"></i> "; 
		}
		ret += this.breadcrumb();
		return ret;
	}

	this.url = function() {
		var suffix = (this.source == "index.md")?"":this.target;
		var ret = this.precursors.targetPath() + suffix;
		ret.replace(".md", ".html");
		if (ret == "/") {
			return "";
		}
		return ret;
	}

	this.parse = function(parser) {
		parser.parse(this);
	}

	this._init();
}

function JekyllParser() {

	this._init = function() {
		if (fs.existsSync(jekyll_out)) {
			wrench.rmdirSyncRecursive(jekyll_out);
		}
		wrench.copyDirSyncRecursive(jekyll_tpl, jekyll_out);
		if (!fs.existsSync(jekyll_out + "/_includes")) {
			fs.mkdirSync(jekyll_out + "/_includes");	
		}
		if (!fs.existsSync(jekyll_out + "/_includes/toc")) {
			fs.mkdirSync(jekyll_out + "/_includes/toc");	
		}
		fs.appendFileSync(jekyll_out+"/_references.md", "[home]: /\n");
		fs.appendFileSync(jekyll_out+"/_config.yml", "location: " + www_prefix + "\n");
	}

	this.parse = function(section) {

		initToc(section);
		handleMarkdownFiles(section, this);
		// handleSubDirectories(section, this);		
	}

	this.handleMarkdownFile = function(section, item, first) {
		if (item.match(/.md$/)) {
			// console.log(item);
			sh.run('kramdown ' + section.sourcePath() + "/" + item + " > " + tmp + "/kramdowned.html 2> /dev/null");
			var html = fs.readFileSync(tmp + "/kramdowned.html", 'utf8');
			var page = section.url() + "/" + item;
			page = page.replace(".md", ".html");
			$ = cheerio.load(html);
			$(':header').each(function(i, element) {
				var location = www_prefix+page + "#" + $(this).attr('id');
			 	fs.appendFileSync(jekyll_out+"/_references.md", "["+$(this).attr('id')+"]: " + location +"\n");
			 	// fs.appendFileSync(jekyll_out + "/_includes/toc" + section.url() + "/toc.md", " * " + "[" + $(this).text() + "][" + $(this).attr('id') + "]\n");
			});
			// $('h1').each(function(i, element) {
			// 	var location = page + "#" + $(this).attr('id');
			//  	fs.appendFileSync(jekyll_out + "/_includes/toc" + section.url() + "/toc.md", " * " + "[" + $(this).text() + "][" + location + "]\n");
			// });
			var title = $('h1').first().text();
			fs.appendFileSync(jekyll_out+"/_references.md", "[_nav-"+title.replace(" ", "-")+"]: " + www_prefix+page +"\n");
			if (!first) {
				fs.appendFileSync(jekyll_out + "/_includes/toc" + section.url() + "/toc.md", " * <i class=\"icon-file-text-alt\"></i>" + "[" + title + "][_nav-" + title.replace(" ", "-") + "]\n");	
			}
					
			var markdown = fs.readFileSync(section.sourcePath() + "/" + item, 'utf8');
			if (www_prefix !== "") {
				markdown = markdown.replace(/\(\/images/g, "("+www_prefix+"/images");
			}
			var yaml = "---\nlayout: default\ntitle: "+title+"\ntoc: toc"+section.url()+"/toc.md\n---\n";
			fs.appendFileSync(section.targetPath() + "/" + item, yaml);
			fs.appendFileSync(section.targetPath() + "/" + item, markdown);
			fs.appendFileSync(section.targetPath() + "/" + item, "\n");
			if (first && item != "index.md") {
				// console.log('this item is becoming the index ' + section.targetPath());
				fs.appendFileSync(section.targetPath() + "/index.md", yaml);
				fs.appendFileSync(section.targetPath() + "/index.md", markdown);
				fs.appendFileSync(section.targetPath() + "/index.md", "\n");				
			}
		}		
	}

	this.handleSubDirectory = function (section, item, first) {
		var stats = fs.statSync(section.sourcePath() + "/" + item);
		if (stats.isDirectory()) {
			// console.log(item);
			if (item == "images") {
				wrench.copyDirSyncRecursive(source+"/images", jekyll_out+"/images");
				return;
			}
			var precursors = new PrecursorList(section, section.precursors);
			var childSection = new Section(item, precursors);
			fs.appendFileSync(jekyll_out+"/_references.md", "[_nav-"+childSection.target+"]: " + www_prefix+childSection.url() +"\n");
			if (fs.existsSync(childSection.sourcePath() + "/meta.yml")) {
				var doc = require(childSection.sourcePath() + "/meta.yml");
				title = doc.title;
			}
			fs.appendFileSync(jekyll_out + "/_includes/toc" + section.url() + "/toc.md", " * <i class=\"icon-folder-close-alt\"></i>" + "[" + childSection.title + "][_nav-" + childSection.target+"]\n");
			fs.mkdirSync(childSection.targetPath());

			if (first) {
				var markdown = "# " + section.title + "\n";
				var yaml = "---\nlayout: default\ntitle: "+section.title+"\ntoc: toc"+section.url()+"/toc.md\n---\n";
				fs.appendFileSync(section.targetPath() + "/index.md", yaml);
				fs.appendFileSync(section.targetPath() + "/index.md", markdown);
				fs.appendFileSync(section.targetPath() + "/index.md", "\n");				
			}

			childSection.parse(this);
		}
	}

	this.referencesFile = function() {
		return jekyll_out+"/_references.md";
	}

	this._init();
}

function LatexPreParser() {

	this._init = function() {
		if (fs.existsSync(latex_out)) {
			wrench.rmdirSyncRecursive(latex_out);
		}
		wrench.copyDirSyncRecursive(latex_tpl, latex_out);
	}

	this.parse = function(section) {
		handleMarkdownFiles(section, this);
//		handleSubDirectories(section, this);		
	}

	this.handleMarkdownFile = function(section, item) {
		if (item.match(/.md$/)) {
			// console.log(item);
			sh.run('kramdown ' + section.sourcePath() + "/" + item + " > " + tmp + "/kramdowned.html 2> /dev/null");
			var html = fs.readFileSync(tmp + "/kramdowned.html", 'utf8');
			$ = cheerio.load(html);
			$(':header').each(function(i, element) {
				var location = $(this).attr('id');
				location = location.replace("index.md", "");
			 	fs.appendFileSync(latex_out+"/references.md", "["+$(this).attr('id')+"]: #" + location +"\n");
			});
		}		
	}

	this.handleSubDirectory = function (section, item) {
		var stats = fs.statSync(section.sourcePath() + "/" + item);
		if (stats.isDirectory()) {
			if (item == "images") {
				return;
			}
			var precursors = new PrecursorList(section, section.precursors);
			var childSection = new Section(item, precursors);
			fs.appendFileSync(latex_out+"/references.md", "["+childSection.target+"]: #" + childSection.url() +"\n");
			childSection.parse(this);
		}
	}

	this.referencesFile = function() {
		return latex_out+"/references.md";
	}

	this._init();
}

function LatexParser() {

	this._init = function() {

	}

	this.parse = function(section) {
		handleMarkdownFiles(section, this);
	}

	this.handleMarkdownFile = function(section, item, first) {
		if (item.match(/.md$/)) {
			// console.log(item);
			sh.run('cat ' + section.sourcePath() + "/" + item + " > " + tmp + "/kramdowned.md");
			sh.run("echo \"\n\" >> " + tmp + "/kramdowned.md");
			var offset = section.precursors.sections.length;
			if (first && offset > 0) {
				offset -= 1;
			}
			sh.run('kramdown -o latex --header-offset ' + offset + " " + tmp + "/kramdowned.md" + " " + latex_out+"/references.md >> " + latex_out + "/doc.tex 2>/dev/null");
		}		
	}

	this.handleSubDirectory = function (section, item, first) {
		var stats = fs.statSync(section.sourcePath() + "/" + item);
		if (stats.isDirectory()) {
			// console.log(item);
			if (item == "images") {
				wrench.copyDirSyncRecursive(source+"/images", latex_out+"/images");
				return;
			}
			var precursors = new PrecursorList(section, section.precursors);
			var childSection = new Section(item, precursors);
			if (first) {
				var markdown = "# " + section.title + "\n";
				fs.writeFileSync(tmp + "/kramdowned.md", markdown);
				var offset = section.precursors.sections.length;
				if (first) {
					offset -= 1;
				}	
				sh.run('kramdown -o latex --header-offset ' + offset + " " + tmp + "/kramdowned.md" + " " + latex_out+"/references.md >> " + latex_out + "/doc.tex 2>/dev/null");	
			}
			childSection.parse(this);
		}
	}

	this.referencesFile = function() {
		return latex_out+"/references.md";
	}

	this._init();
}

function initToc(section) {
		/// initialize a TOC entry for this subfolder
	if (!fs.existsSync(jekyll_out + "/_includes/toc" + section.url())) {
		fs.mkdirSync(jekyll_out + "/_includes/toc" + section.url());	
	}
	fs.appendFileSync(jekyll_out + "/_includes/toc" + section.url() + "/toc.md", section.breadcrumbs() + "\n\n");
}

function handleMarkdownFiles(section, parser) {
	var first = true;
	section.contents.forEach(function (item) {
		var isHidden = /^\./.test(item);		
		if (!isHidden) {
			parser.handleMarkdownFile(section, item, first);
			parser.handleSubDirectory(section, item, first);
			first = false;
		}
	});
}

function startBuild(path) {
	var root = new Section("");
	if (build_html) {
		if (path === undefined) {
			process.stdout.write("Generating static website ... ");
		} else {
			process.stdout.write("Regenerating static website ... ");
		}
		var jekyll_parser = new JekyllParser();
		root.parse(jekyll_parser);
		sh.run('jekyll build -s ' + jekyll_out + " -d " + jekyll_out + "/_site &> /dev/null");
		console.log("done");
	}

	if (build_pdf) {
		if (path === undefined) {
			process.stdout.write("Generating PDF ... ");
		} else {
			process.stdout.write("Regenerating PDF ... ");
		}
		var latex_pre_parser = new LatexPreParser();
		root.parse(latex_pre_parser);
		var latex_parser = new LatexParser();
		root.parse(latex_parser);
		sh.run("cd " + latex_out + "; sed 's#\\\includegraphics{" + image_prefix + "#\\\includegraphics\[width=" + latex_image_width + "\]{images#g' doc.tex > tmp.tex; sed 's#begin{figure}#begin{figure}[H]#g' tmp.tex > doc.tex; rm tmp.tex");
		
		var latex = fs.readFileSync(latex_out + "/doc.tex", 'utf8');
		latex = latex.replace(/{verbatim}/g, "{lstlisting}\n");
		fs.writeFileSync(latex_out + "/doc.tex", latex);

		sh.run("cd " + latex_out + "; pdflatex --interaction=batchmode main.tex &> /dev/null; pdflatex --interaction=batchmode main.tex &> /dev/null");
		console.log("done");
	}
}

var buildTimer = null;

function handleEvent(path) {
	process.stdout.write("Change detected in: " + path + "\n");

	if (buildTimer !== null ) {
		return;
	}

	buildTimer = setTimeout(function() { startBuild(path); buildTimer = null; }, 1000);
}

if (argv.w) {
	var watcher = chokidar.watch(source, {persistent: true, ignoreInitial: true});
	watcher.add(tpl);

	console.log('Watching:');
	console.log('\t --docs\t\t' + source);
	console.log('\t --template\t' + tpl);

	watcher
	  .on('add', handleEvent)
	  .on('change', handleEvent)
	  .on('unlink', handleEvent);
}

if (argv.s) {
	if (!build_html) {
		console.log('Starting web server when not outputting HTML is rather pointless.')
	} else {
		app.use(express.static(jekyll_out + "/_site"));
		app.listen(process.env.PORT || 4000);
		console.log("Listening on localhost:4000");
	}
}

console.log("Outputting to " + argv.d+"/build")

startBuild();


grunt-contrib-cleanse
====

A POC grunt task intended to scan your build for asset files (jpg, png, css, js etc) not referenced in your html/templates and deletes these orphaned files from your build.

Inspiration spawned from this stackoverflow answer: http://stackoverflow.com/questions/19423879/a-grunt-task-script-or-application-which-removes-unused-assets

**Cons**
- It's built using regexes which handle a limited range of use-cases. So don't expect full compatibility with every project.
- Not fully tested. Do not advise to use in production.

**Usage**

```javascript

// within you initConfig

cleanse : {
	images :{
		// list files with instances of href="", src="" and url("")
		templates : [
			'my_site/templates/*.html',
			'my_site/css/styles.css'
		],
		// point to your asset directories, the script will compare the
		// files in these with the ones it finds in your templates
		assets : [
			'my_site/img/*'
		],
		// optional. list files you want the script to ignore.
		ignore : [
			'favicon.ico',
			'img/og_image.jpg'
			]
		},
		// optional. deletes orphaned files. Must be explicitly set to true.
		// warning: there is no confirm dialog unfortunately.
		delete : true
	}

```

**Use cases**

The following patterns should work.
Note: It should work for any file extension, jpg is used here as an example

```javascript

<a href="my_site/image.jpg">Link</a>
<a href="{% static "images.jpg" %}">Link</a>

<img src="my_site/image.jpg" />
<img src="{% static "image.jpg" %}" />

background: url(my_site/image.jpg)
background: url("my_site/image.jpg")


```



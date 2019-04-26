![WebGL Insight](http://i.imgur.com/Zb2PHLp.png)


## About

Insight is a WebGL debugging toolkit providing a variety of capabilities enabling more productive WebGL development and more efficient WebGL applications.


## Features

* Chrome Extension embedded in the Chrome DevTools panel    
* Overdraw Inspector
* Mipmap Inspector
* Depth Inspector
* Call Stack Timeline and Statistics
* Program Usage Count
* Duplicate Program Usage Detector
* Program Viewer
* Frame Control
* State Variable Editor
* Resource Viewer


## Installation & Usage

Install Insight from the [Chrome Web Store](https://chrome.google.com/webstore/detail/webgl-insight/djdcbmfacaaocoomokenoalbomllhnko).

When the extension is installed, open up the Chrome DevTools panel, click on the "WebGL Insight" tab, and browse to a WebGL application.


### Overdraw Inspector

Detects how how many times a pixel has been drawn. The color ranges from green to red. Red shows a pixel that has been overdrawn multiple times while green is drawn on clear.

![Before](http://i.imgur.com/WfCwiDJ.jpg)
![After](http://i.imgur.com/RSkEeQu.jpg)

### Mipmap Inspector

Displays the mipmap levels for a selected texture in different colors. Depending on how many mipmap levels there are and the maximum mipmap level, the colors will vary. This can be used to show whether certain mipmap levels of a selected texture is used.

![Before](http://i.imgur.com/v717Sb9.jpg)
![After](http://i.imgur.com/gT1y3Ir.jpg)

### Depth Inspector 

Displays the relative depths of the pixels being drawn. Lighter values are further away whereas darker values are closer.

![Before](http://i.imgur.com/4Je54s1.jpg)
![After](http://i.imgur.com/M3xDkpp.jpg)

### Call Stack Timeline and Statistics

Collects WebGL calls in a timeline.

![Call Timeline](http://i.imgur.com/xouoZXV.jpg)

Counts WebGL calls during that time and displays the result in a histogram.

![Call Statistics](http://i.imgur.com/2r0yXd4.jpg)

### Program Usage Count

 Record how many times each shader program has been called by useProgram.

![Program Usage](http://i.imgur.com/gjlMI8y.jpg)

### Duplicate Program Usage Detection

Detects whether there are any duplicate useProgram calls on the same program.

![Duplicate Usage](http://i.imgur.com/UOJ2GnX.jpg)

### Program Viewer

![Program View](http://i.imgur.com/v6cgTGb.jpg)

### Frame Control

Pauses and controls animated frames.

![Frame Control](http://i.imgur.com/YS3uhw9.jpg)

### State Variable Editor

Edit WebGL states.

![State Editor](http://i.imgur.com/1QBVF9M.jpg)

### Resource Viewer

View textures, buffers, frame buffers, and render buffers.

![Resource Viewer](http://i.imgur.com/y1YETWv.jpg)

## Known Issues

* Unity Web Game support is limited

# Development

Just load the folder as an unpacked Extension. 

There are 3 possible DevTools to open to debug the extension.

1. The extension's background page. This isn't useful.
1. The DevTools you have open to inspect the page (and view the extension panel). Obviously neccessary, and since the instrumentation is injected into the page, much of the extension code is debuggable here.
1. [DevTools on DevTools](https://stackoverflow.com/a/12291163/89484). Much of the tricky stuff runs in this context, so you'll want to keep it open.

# Releasing

(Guesses from a non-maintainer) Run build/build.sh, which should concatenate the src files and copy to your (Mac) clipboard. Then paste into the top of `content_script_init.js`. 
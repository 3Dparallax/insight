# Roadmap

This document provides a list of planned changes prioritized for WebGL Insight. This should serve as a reference point for anyone interested in where the project is going, and help determine if a contribution could conflict with some of the project's longer term plans.

A patch for a feature here will not automatically be refused! We are happy to receive patches for cool new features we haven't thought about or prioritize properly.

Features currently being worked on will be listed and assigned to someone in the [Issues](https://github.com/3dparallax/insight/issues).

There is currently no timeline for any of the proposed changes because the main contributors are finishing their undergrads.

## Features and Refactoring

### Attribute and Normal Inspector

The attribute viewer is used to view variables declared in the vertex and fragment shaders.

### Shared Code

There is a lot of shared code across files that can be made more clean.

* **pixel inspector** and **depth inspector**
* **buffer viewer** and **texture viewer**

### Folder Structure and File Responsibility

There are plans proposed to more properly modularize the structure of the project to reduce clutter.

## Frozen Features

### iframe Support

`iframe` support is currently not supported.

## Bugs

* non-user-created programs in program view

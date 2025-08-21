# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [0.1.4] - 2025-08-20
### Added
- Release automation workflow: GitHub Action to create a Release on pushing tags matching `v*`.
- NPM script `release:tag` to tag the current package version (`v${npm_package_version}`).

### Changed
- Bumped version in package.json from 0.1.3 to 0.1.4.

### Notes
- To publish a release: create a tag named `v0.1.4` (or newer) and push it to the repository. The workflow will generate a GitHub Release and changelog from PRs automatically.

## [0.1.3] - 2025-08-20
- Previous release.

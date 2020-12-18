# Contributing To elefgy

Please take a moment to review this document in order to make the contribution
process easy and effective for everyone involved.

Following these guidelines helps to communicate that you respect the time of
the developers managing and developing this open source project. In return,
they should reciprocate that respect in addressing your issue or assessing
patches and features.

## Bug Reports

## Feature Requests

## Source Code

All changes should be made within branches created from the current `devel`
(development) branch and named clearly reflecting the purpose of the changes.
For example: `devel-cool-new-feature` or `devel-fix-issue-420`. Only once the
branch is considered stable should the changes be pulled into `devel`.

The `main` branch is permanent and for production code only. Once the `devel`
branch is proven stable for production will it be pulled into `main`. Releases
will be tagged with a version number for chronological record.

A permanent branch named `documentation` is for edits to the readme and other
text documents kept with the source code. It is so changes can be pushed to
`main` at a timely manner.

Version numbering is `major.minor.revision` where `revision` is smaller edits
and bug fixes, `minor` is feature releases, and `major` is core changes that are
not guaranteed backwards compatibility.

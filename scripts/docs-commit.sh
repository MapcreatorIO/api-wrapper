#!/usr/bin/env bash

function cleanDir {
  junk=$(ls -a | grep -ve docs -e .git -e .gitignore)

  rm -rf ${junk} || true
}

mv -v dist docs
cleanDir

git checkout gh-pages
cleanDir
mv docs/* ./
rm -r docs

touch .nojekyll

git config --global user.email "noreply@mapcreator.eu"
git config --global user.name Jenkins
git add .
git status

git commit -m "Update auto generated docs"
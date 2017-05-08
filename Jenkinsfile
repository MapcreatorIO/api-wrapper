@Library('deployment') _
import org.mapcreator.Deploy

def git_push(branch) {
	withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: '7bdf0a8c-d1c2-44a4-8644-a4677f0662aa', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD']]) {
		sh "git push -u https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/MapCreatorEU/m4n-api.git ${branch}"
	}
}

node('npm && yarn') {
	if (!isUnix()) {
		error 'Only compatible with UNIX systems.'
	}

	stage('checkout') {
		checkout scm
	}

	stage('initialize') {
		sh 'yarn --no-emoji --non-interactive --no-progress'
		sh 'rm -r dist docs || true'
	}

	stage('linter') {
	 	sh '$(yarn bin)/eslint --no-color --max-warnings 5 --format checkstyle --output-file build/checkstyle.xml src'
	 	checkstyle pattern: 'build/checkstyle.xml'
	}

	stage('build') {
		sh '$(yarn bin)/webpack'
	}

	stage('archive') {
		archiveArtifacts artifacts: 'dist/*', fingerprint: true
	}

	if (BRANCH_NAME in ['master']) {
		stage('tag') {
			PACKAGE_VERSION = sh('node -pe "JSON.parse(process.argv[1]).version" "$(cat package.json)"')
			SET_TAG = sh("git rev-parse ${PACKAGE_VERSION}",	returnStatus: true) != 0

			if (SET_TAG) {
				echo "Setting tag ${PACKAGE_VERSION}"

				CHANGELOG = sh('git log --oneline --decorate --no-color $(git tag --sort version:refname | tail -n 1)...HEAD || echo master')

				sh "git tag -a '${PACKAGE_VERSION}' -m 'Bumping version to ${PACKAGE_VERSION}\nChangelog:\n${CHANGELOG}'"

				gh_push 'master'
			}
		}

		stage('docs') {
			sh '$(yarn bin)/esdoc'

			sh 'mv -v dist docs/'
			sh 'rm -rf $(ls -a | grep -ve docs -e .git -e .gitignore) || true'

			sh 'git checkout gh-pages'

			sh 'rm -rf $(ls -a | grep -ve docs -e .git -e .gitignore) || true'
			sh 'mv docs/* ./'
			sh 'rm -r docs'

			sh 'git config --global user.email "noreply@mapcreator.eu"'
			sh 'git config --global user.name Jenkins'
			sh 'git add .'
			sh 'git status'

			sh 'git commit -m "Update auto generated docs"'

			git_push 'gh-pages'
		}
	}

	stage('cleanup') {
		sh 'rm -rf node_modules dist docs build || true'
	}
}

// vim: set ft=groovy:
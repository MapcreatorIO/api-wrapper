@Library('deployment') _
import org.mapcreator.Deploy

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
		parallel webpack: {
			sh '$(yarn bin)/webpack'
		}, esdoc: {
			sh '$(yarn bin)/esdoc'
		}, failFast: false
	}

	stage('archive') {
		archiveArtifacts artifacts: 'dist/*', fingerprint: true
	}

	if (BRANCH_NAME in ['master']) {
		stage('publish') {
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

			withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: '7bdf0a8c-d1c2-44a4-8644-a4677f0662aa', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD']]) {
				sh 'git commit -m "Update auto generated docs"'
				sh 'git push -u https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/MapCreatorEU/m4n-api.git gh-pages'
			}
		}
	}

	stage('cleanup') {
		sh 'rm -rf node_modules dist docs build || true'
	}
}

// vim: set ft=groovy: